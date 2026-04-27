import { Field, ID, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { ConversationParticipant } from "./conversation-participant.entity";
import { Message } from "./message.entity";

@ObjectType()
@Entity("conversations")
export class Conversation {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", nullable: true })
  name: string | null;

  @Field()
  @Column({ default: "open" })
  status: "open" | "closed";

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: "timestamp", nullable: true })
  lastMessageAt: Date | null;

  @Field(() => [ConversationParticipant], { nullable: true })
  @OneToMany(() => ConversationParticipant, (participant) => participant.conversation, {
    cascade: true,
    eager: true
  })
  participants: ConversationParticipant[];

  @Field(() => [Message], { nullable: true })
  @OneToMany(() => Message, (message) => message.conversation, { cascade: true })
  messages: Message[];
}
