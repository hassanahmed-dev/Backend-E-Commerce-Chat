import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "../../entities/conversation.entity";
import { ConversationParticipant } from "../../entities/conversation-participant.entity";
import { Message } from "../../entities/message.entity";
import { Order } from "../../entities/order.entity";
import { OrderItem } from "../../entities/order-item.entity";
import { Product } from "../../entities/product.entity";
import { User } from "../../entities/user.entity";
import { AdminChatFilterInput } from "./dto/admin-chat-filter.input";
import { AdminAiResponse } from "./dto/admin-ai-response.type";
import { AdminAskAiInput } from "./dto/admin-ask-ai.input";
import { AdminSendMessageInput } from "./dto/admin-send-message.input";
import { AssignConversationInput } from "./dto/assign-conversation.input";
import { ChatAiService } from "./chat-ai.service";
import { CreateAdminConversationInput } from "./dto/create-admin-conversation.input";
import { CreateSupportConversationInput } from "./dto/create-support-conversation.input";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantsRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly chatAiService: ChatAiService
  ) {}

  async getAdminConversations(filter?: AdminChatFilterInput): Promise<Conversation[]> {
    const query = this.conversationsRepository
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.participants", "participant")
      .leftJoinAndSelect("participant.user", "participantUser")
      .orderBy("conversation.lastMessageAt", "DESC", "NULLS LAST")
      .addOrderBy("conversation.createdAt", "DESC");

    if (filter?.status) {
      query.andWhere("conversation.status = :status", { status: filter.status });
    }

    if (filter?.search?.trim()) {
      const search = `%${filter.search.trim().toLowerCase()}%`;
      query.andWhere(
        "(LOWER(conversation.name) LIKE :search OR LOWER(participantUser.name) LIKE :search OR LOWER(participantUser.email) LIKE :search)",
        { search }
      );
    }

    return query.getMany();
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    await this.assertConversationExists(conversationId);
    return this.messagesRepository.find({
      where: { conversation: { id: conversationId } },
      relations: { conversation: true },
      order: { createdAt: "ASC" }
    });
  }

  async sendAdminMessage(input: AdminSendMessageInput, adminUserId: string): Promise<Message> {
    const conversation = await this.assertConversationExists(input.conversationId);
    const admin = await this.usersRepository.findOne({ where: { id: adminUserId } });
    if (!admin) {
      throw new NotFoundException("Admin user not found");
    }

    await this.ensureParticipant(conversation.id, admin.id, "admin");

    const message = this.messagesRepository.create({
      conversation,
      sender: admin,
      senderType: "admin",
      content: input.content.trim()
    });

    const saved = await this.messagesRepository.save(message);
    conversation.lastMessageAt = new Date();
    await this.conversationsRepository.save(conversation);
    return saved;
  }

  async askAi(input: AdminAskAiInput, adminUserId: string): Promise<AdminAiResponse> {
    const trimmedPrompt = input.prompt.trim();
    if (!trimmedPrompt) {
      throw new BadRequestException("Prompt is required");
    }

    const adminMessage = await this.sendAdminMessage(
      { conversationId: input.conversationId, content: trimmedPrompt },
      adminUserId
    );

    const conversation = await this.assertConversationExists(input.conversationId);
    const analyticsContext = await this.buildAnalyticsContext();
    const aiText = await this.chatAiService.generateAdminReply(trimmedPrompt, analyticsContext);
    const aiMessage = this.messagesRepository.create({
      conversation,
      sender: null,
      senderType: "ai",
      content: aiText
    });
    const savedAiMessage = await this.messagesRepository.save(aiMessage);
    conversation.lastMessageAt = new Date();
    await this.conversationsRepository.save(conversation);

    return {
      adminMessage,
      aiMessage: savedAiMessage
    };
  }

  async assignConversation(input: AssignConversationInput): Promise<ConversationParticipant> {
    const conversation = await this.assertConversationExists(input.conversationId);
    const admin = await this.usersRepository.findOne({ where: { id: input.adminId } });
    if (!admin) {
      throw new NotFoundException("Admin user not found");
    }

    return this.ensureParticipant(conversation.id, admin.id, "admin");
  }

  async closeConversation(conversationId: string): Promise<Conversation> {
    const conversation = await this.assertConversationExists(conversationId);
    conversation.status = "closed";
    return this.conversationsRepository.save(conversation);
  }

  async createSupportConversation(input: CreateSupportConversationInput): Promise<Conversation> {
    const userId = input.userId?.trim();
    const userEmail = input.userEmail?.trim().toLowerCase();

    if (!userId && !userEmail) {
      throw new BadRequestException("Provide userId or userEmail to start a conversation");
    }

    const user = userId
      ? await this.usersRepository.findOne({ where: { id: userId } })
      : await this.usersRepository.findOne({ where: { email: userEmail } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const conversation = this.conversationsRepository.create({
      status: "open",
      lastMessageAt: null
    });
    const savedConversation = await this.conversationsRepository.save(conversation);

    await this.ensureParticipant(savedConversation.id, user.id, "user");

    if (input.initialMessage?.trim()) {
      const initialMessage = this.messagesRepository.create({
        conversation: savedConversation,
        sender: user,
        senderType: "user",
        content: input.initialMessage.trim()
      });
      await this.messagesRepository.save(initialMessage);
      savedConversation.lastMessageAt = new Date();
      await this.conversationsRepository.save(savedConversation);
    }

    return this.assertConversationExists(savedConversation.id);
  }

  async createAdminConversation(
    input: CreateAdminConversationInput,
    adminUserId: string
  ): Promise<Conversation> {
    const admin = await this.usersRepository.findOne({ where: { id: adminUserId } });
    if (!admin) {
      throw new NotFoundException("Admin user not found");
    }

    const chatName = input.chatName?.trim();
    const conversation = this.conversationsRepository.create({
      name: chatName || null,
      status: "open",
      lastMessageAt: null
    });
    const savedConversation = await this.conversationsRepository.save(conversation);
    await this.ensureParticipant(savedConversation.id, admin.id, "admin");

    if (input.initialMessage?.trim()) {
      const initialMessage = this.messagesRepository.create({
        conversation: savedConversation,
        sender: admin,
        senderType: "admin",
        content: input.initialMessage.trim()
      });
      await this.messagesRepository.save(initialMessage);
      savedConversation.lastMessageAt = new Date();
      await this.conversationsRepository.save(savedConversation);
    }

    return this.assertConversationExists(savedConversation.id);
  }

  async renameConversation(conversationId: string, chatName: string): Promise<Conversation> {
    const conversation = await this.assertConversationExists(conversationId);
    conversation.name = chatName.trim();
    return this.conversationsRepository.save(conversation);
  }

  async deleteConversationPermanently(conversationId: string): Promise<boolean> {
    await this.assertConversationExists(conversationId);
    const result = await this.conversationsRepository.delete(conversationId);
    return Boolean(result.affected);
  }

  async userStartSupportChat(userId: string, initialMessage?: string): Promise<Conversation> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const conversation = this.conversationsRepository.create({ status: "open", lastMessageAt: null });
    const saved = await this.conversationsRepository.save(conversation);
    await this.ensureParticipant(saved.id, userId, "user");

    if (initialMessage?.trim()) {
      const msg = this.messagesRepository.create({
        conversation: saved,
        sender: user,
        senderType: "user",
        content: initialMessage.trim()
      });
      await this.messagesRepository.save(msg);
      saved.lastMessageAt = new Date();
      await this.conversationsRepository.save(saved);
    }

    return this.assertConversationExists(saved.id);
  }

  async userSendMessage(conversationId: string, userId: string, content: string): Promise<Message> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId, participants: { user: { id: userId } } },
      relations: { participants: { user: true } }
    });
    if (!conversation) throw new NotFoundException("Conversation not found or access denied");

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const message = this.messagesRepository.create({
      conversation,
      sender: user,
      senderType: "user",
      content: content.trim()
    });

    const saved = await this.messagesRepository.save(message);
    conversation.lastMessageAt = new Date();
    await this.conversationsRepository.save(conversation);
    return saved;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsRepository
      .createQueryBuilder("conversation")
      .innerJoin("conversation.participants", "participant")
      .innerJoin("participant.user", "u", "u.id = :userId", { userId })
      .leftJoinAndSelect("conversation.participants", "allParticipants")
      .leftJoinAndSelect("allParticipants.user", "participantUser")
      .orderBy("conversation.lastMessageAt", "DESC", "NULLS LAST")
      .getMany();
  }

  async getUserConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId, participants: { user: { id: userId } } },
      relations: { participants: { user: true } }
    });
    if (!conversation) throw new NotFoundException("Conversation not found or access denied");

    return this.messagesRepository.find({
      where: { conversation: { id: conversationId } },
      relations: { conversation: true },
      order: { createdAt: "ASC" }
    });
  }

  private async ensureParticipant(
    conversationId: string,
    userId: string,
    role: "user" | "admin"
  ): Promise<ConversationParticipant> {
    const existing = await this.participantsRepository.findOne({
      where: { conversation: { id: conversationId }, user: { id: userId } },
      relations: { conversation: true, user: true }
    });

    if (existing) {
      return existing;
    }

    const conversation = await this.assertConversationExists(conversationId);
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const participant = this.participantsRepository.create({
      conversation,
      user,
      role
    });
    return this.participantsRepository.save(participant);
  }

  private async assertConversationExists(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
      relations: { participants: { user: true } }
    });
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }
    return conversation;
  }

  private async buildAnalyticsContext(): Promise<string> {
    const totalUsers = await this.usersRepository.count();
    const totalAdmins = await this.usersRepository.count({ where: { role: "admin" } });
    const activeUsers = await this.usersRepository.count({ where: { isActive: true } });

    const totalProducts = await this.productsRepository.count();
    const productsInStock = await this.productsRepository
      .createQueryBuilder("product")
      .where("product.stock > 0")
      .getCount();
    const totalOrders = await this.ordersRepository.count();
    const totalConversations = await this.conversationsRepository.count();
    const openConversations = await this.conversationsRepository.count({ where: { status: "open" } });
    const totalMessages = await this.messagesRepository.count();

    const soldRaw = await this.orderItemsRepository
      .createQueryBuilder("orderItem")
      .select("COALESCE(SUM(orderItem.quantity), 0)", "total")
      .getRawOne<{ total: string }>();
    const soldUnits = Number(soldRaw?.total ?? 0);

    const revenueRaw = await this.ordersRepository
      .createQueryBuilder("order")
      .select("COALESCE(SUM(order.total), 0)", "total")
      .getRawOne<{ total: string }>();
    const totalRevenue = Number(revenueRaw?.total ?? 0);

    const topProductsRows = await this.orderItemsRepository
      .createQueryBuilder("orderItem")
      .leftJoin("orderItem.product", "product")
      .select("product.name", "name")
      .addSelect("COALESCE(SUM(orderItem.quantity), 0)", "qty")
      .groupBy("product.name")
      .orderBy("qty", "DESC")
      .limit(5)
      .getRawMany<{ name: string; qty: string }>();

    const topProducts = topProductsRows
      .map((row) => `${row.name}: ${Number(row.qty)}`)
      .join(", ");

    const productRows = await this.productsRepository.find({
      select: { name: true },
      order: { name: "ASC" },
      take: 200
    });
    const allProductNames = productRows
      .map((product) => product.name?.trim())
      .filter((name): name is string => Boolean(name))
      .join(" | ");

    const recentChats = await this.conversationsRepository.find({
      order: { updatedAt: "DESC" },
      take: 5
    });
    const recentChatSummary = recentChats
      .map((chat) => `${chat.name?.trim() || chat.id.slice(0, 8)} (${chat.status})`)
      .join(", ");

    const allUsers = await this.usersRepository.find({
      select: { id: true, name: true, email: true, role: true, isActive: true },
      order: { name: "ASC" }
    });
    const allProducts = await this.productsRepository.find({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        stock: true,
        rating: true,
        imageUrl: true
      },
      order: { name: "ASC" }
    });
    const allOrders = await this.ordersRepository.find({
      relations: { user: true, items: { product: true } }
    });
    const allConversations = await this.conversationsRepository.find({
      relations: { participants: { user: true } },
      order: { updatedAt: "DESC" }
    });
    const latestMessages = await this.messagesRepository.find({
      relations: { conversation: true, sender: true },
      order: { createdAt: "DESC" },
      take: 500
    });

    const storeSnapshot = {
      totals: {
        users: totalUsers,
        activeUsers,
        adminUsers: totalAdmins,
        products: totalProducts,
        productsInStock,
        soldUnits,
        orders: totalOrders,
        conversations: totalConversations,
        openConversations,
        messages: totalMessages,
        totalRevenue: Number(totalRevenue.toFixed(2))
      },
      users: allUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      })),
      products: allProducts.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: Number(product.price),
        stock: product.stock,
        rating: Number(product.rating),
        imageUrl: product.imageUrl
      })),
      orders: allOrders.map((order) => ({
        id: order.id,
        status: order.status,
        total: Number(order.total),
        user: order.user
          ? {
              id: order.user.id,
              name: order.user.name,
              email: order.user.email
            }
          : null,
        items: (order.items ?? []).map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.unitPrice) * item.quantity,
          product: item.product
            ? {
                id: item.product.id,
                name: item.product.name,
                category: item.product.category
              }
            : null
        }))
      })),
      conversations: allConversations.map((conversation) => ({
        id: conversation.id,
        name: conversation.name,
        status: conversation.status,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        lastMessageAt: conversation.lastMessageAt,
        participants: (conversation.participants ?? []).map((participant) => ({
          role: participant.role,
          user: participant.user
            ? {
                id: participant.user.id,
                name: participant.user.name,
                email: participant.user.email,
                role: participant.user.role
              }
            : null
        }))
      })),
      latestMessages: latestMessages.map((message) => ({
        id: message.id,
        content: message.content,
        senderType: message.senderType,
        createdAt: message.createdAt,
        conversationId: message.conversation?.id ?? null,
        sender: message.sender
          ? {
              id: message.sender.id,
              name: message.sender.name,
              email: message.sender.email
            }
          : null
      }))
    };

    return [
      "database_scope=users, products, orders, order_items, conversations, messages, cart_items, wishlist_items",
      `total_users=${totalUsers}`,
      `active_users=${activeUsers}`,
      `admin_users=${totalAdmins}`,
      `total_products=${totalProducts}`,
      `products_in_stock=${productsInStock}`,
      `sold_units=${soldUnits}`,
      `total_orders=${totalOrders}`,
      `total_conversations=${totalConversations}`,
      `open_conversations=${openConversations}`,
      `total_messages=${totalMessages}`,
      `total_revenue=${totalRevenue.toFixed(2)}`,
      `top_products=${topProducts || "N/A"}`,
      `all_product_names=${allProductNames || "N/A"}`,
      `recent_chats=${recentChatSummary || "N/A"}`,
      "",
      "STORE_SNAPSHOT_JSON",
      JSON.stringify(storeSnapshot)
    ].join("\n");
  }
}
