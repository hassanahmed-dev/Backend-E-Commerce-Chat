import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CartItem } from "./cart-item.entity";
import { WishlistItem } from "./wishlist-item.entity";
import { Order } from "./order.entity";
import { ConversationParticipant } from "./conversation-participant.entity";
import { Message } from "./message.entity";

@ObjectType()
@Entity("users")
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ default: "user" })
  role: "user" | "admin";

  @Column({ default: "" })
  passwordHash: string;

  @OneToMany(() => CartItem, (item) => item.user)
  cartItems: CartItem[];

  @OneToMany(() => WishlistItem, (item) => item.user)
  wishlistItems: WishlistItem[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => ConversationParticipant, (participant) => participant.user)
  conversationParticipants: ConversationParticipant[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];
}