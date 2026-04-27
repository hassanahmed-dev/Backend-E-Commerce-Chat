import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entity";
import { User } from "./user.entity";

@ObjectType()
@Entity("conversation_participants")
export class ConversationParticipant {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ default: "user" })
  role: "user" | "admin";

  @Field(() => Conversation)
  @ManyToOne(() => Conversation, (conversation) => conversation.participants, { onDelete: "CASCADE" })
  conversation: Conversation;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true, onDelete: "CASCADE" })
  user: User;
}
