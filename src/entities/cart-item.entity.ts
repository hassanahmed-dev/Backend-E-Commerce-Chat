import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Product } from "./product.entity";

@ObjectType()
@Entity("cart_items")
export class CartItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => Int)
  @Column({ default: 1 })
  quantity: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: "CASCADE" })
  user: User;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.cartItems, { eager: true, onDelete: "CASCADE" })
  product: Product;
}