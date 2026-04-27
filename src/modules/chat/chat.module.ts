import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "../../entities/conversation.entity";
import { ConversationParticipant } from "../../entities/conversation-participant.entity";
import { Message } from "../../entities/message.entity";
import { Order } from "../../entities/order.entity";
import { OrderItem } from "../../entities/order-item.entity";
import { Product } from "../../entities/product.entity";
import { User } from "../../entities/user.entity";
import { AuthModule } from "../auth/auth.module";
import { ChatAiService } from "./chat-ai.service";
import { ChatResolver } from "./chat.resolver";
import { ChatService } from "./chat.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ConversationParticipant,
      Message,
      User,
      Product,
      Order,
      OrderItem
    ]),
    AuthModule
  ],
  providers: [ChatResolver, ChatService, ChatAiService],
  exports: [ChatService]
})
export class ChatModule {}
