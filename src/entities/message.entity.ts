import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entity";
import { User } from "./user.entity";

@ObjectType()
@Entity("messages")
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ type: "text" })
  content: string;

  @Field()
  @Column({ default: "user" })
  senderType: "user" | "admin" | "ai" | "system";

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Conversation)
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: "CASCADE" })
  conversation: Conversation;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { eager: true, nullable: true, onDelete: "SET NULL" })
  sender: User | null;
}
