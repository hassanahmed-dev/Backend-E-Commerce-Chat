import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Conversation } from "../../entities/conversation.entity";
import { ConversationParticipant } from "../../entities/conversation-participant.entity";
import { Message } from "../../entities/message.entity";
import { AuthService } from "../auth/auth.service";
import { ChatService } from "./chat.service";
import { AdminAiResponse } from "./dto/admin-ai-response.type";
import { AdminAskAiInput } from "./dto/admin-ask-ai.input";
import { AdminChatFilterInput } from "./dto/admin-chat-filter.input";
import { AdminSendMessageInput } from "./dto/admin-send-message.input";
import { AssignConversationInput } from "./dto/assign-conversation.input";
import { CreateAdminConversationInput } from "./dto/create-admin-conversation.input";
import { CreateSupportConversationInput } from "./dto/create-support-conversation.input";

@Resolver()
export class ChatResolver {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService
  ) {}

  @Query(() => [Conversation])
  async adminConversations(
    @Args("authorization", { type: () => String }) authorization: string,
    @Args("filter", { type: () => AdminChatFilterInput, nullable: true }) filter?: AdminChatFilterInput
  ): Promise<Conversation[]> {
    await this.assertAdmin(authorization);
    return this.chatService.getAdminConversations(filter);
  }

  @Query(() => [Message])
  async conversationMessages(
    @Args("conversationId") conversationId: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Message[]> {
    await this.assertAdmin(authorization);
    return this.chatService.getConversationMessages(conversationId);
  }

  @Mutation(() => Message)
  async adminSendMessage(
    @Args("input") input: AdminSendMessageInput,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Message> {
    const payload = await this.assertAdmin(authorization);
    return this.chatService.sendAdminMessage(input, payload.sub);
  }

  @Mutation(() => AdminAiResponse)
  async adminAskAi(
    @Args("input") input: AdminAskAiInput,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<AdminAiResponse> {
    const payload = await this.assertAdmin(authorization);
    return this.chatService.askAi(input, payload.sub);
  }

  @Mutation(() => ConversationParticipant)
  async assignConversation(
    @Args("input") input: AssignConversationInput,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<ConversationParticipant> {
    await this.assertAdmin(authorization);
    return this.chatService.assignConversation(input);
  }

  @Mutation(() => Conversation)
  async closeConversation(
    @Args("conversationId") conversationId: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Conversation> {
    await this.assertAdmin(authorization);
    return this.chatService.closeConversation(conversationId);
  }

  @Mutation(() => Conversation)
  async createSupportConversation(
    @Args("input") input: CreateSupportConversationInput,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Conversation> {
    await this.assertAdmin(authorization);
    return this.chatService.createSupportConversation(input);
  }

  @Mutation(() => Conversation)
  async createAdminConversation(
    @Args("input", { type: () => CreateAdminConversationInput, nullable: true })
    input: CreateAdminConversationInput | undefined,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Conversation> {
    const payload = await this.assertAdmin(authorization);
    return this.chatService.createAdminConversation(input ?? {}, payload.sub);
  }

  @Mutation(() => Conversation)
  async renameConversation(
    @Args("conversationId") conversationId: string,
    @Args("chatName") chatName: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Conversation> {
    await this.assertAdmin(authorization);
    return this.chatService.renameConversation(conversationId, chatName);
  }

  @Mutation(() => Boolean)
  async deleteConversationPermanently(
    @Args("conversationId") conversationId: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<boolean> {
    await this.assertAdmin(authorization);
    return this.chatService.deleteConversationPermanently(conversationId);
  }

  @Mutation(() => Conversation)
  async userStartSupportChat(
    @Args("authorization", { type: () => String }) authorization: string,
    @Args("initialMessage", { type: () => String, nullable: true }) initialMessage?: string
  ): Promise<Conversation> {
    const payload = await this.verifyUser(authorization);
    return this.chatService.userStartSupportChat(payload.sub, initialMessage);
  }

  @Mutation(() => Message)
  async userSendMessage(
    @Args("conversationId") conversationId: string,
    @Args("content") content: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Message> {
    const payload = await this.verifyUser(authorization);
    return this.chatService.userSendMessage(conversationId, payload.sub, content);
  }

  @Query(() => [Conversation])
  async userConversations(
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Conversation[]> {
    const payload = await this.verifyUser(authorization);
    return this.chatService.getUserConversations(payload.sub);
  }

  @Query(() => [Message])
  async userConversationMessages(
    @Args("conversationId") conversationId: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Message[]> {
    const payload = await this.verifyUser(authorization);
    return this.chatService.getUserConversationMessages(conversationId, payload.sub);
  }

  private async verifyUser(authorization: string): Promise<{ sub: string; email: string; role: string }> {
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }
    const token = authorization.replace("Bearer ", "").trim();
    return this.authService.verifyToken(token);
  }

  private async assertAdmin(
    authorization: string
  ): Promise<{ sub: string; email: string; role: string }> {
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const token = authorization.replace("Bearer ", "").trim();
    const payload = await this.authService.verifyToken(token);
    if (payload.role !== "admin") {
      throw new ForbiddenException("Admin access required");
    }
    return payload;
  }
}
