import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Product } from "./product.entity";

@ObjectType()
@Entity("wishlist_items")
export class WishlistItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.wishlistItems, { onDelete: "CASCADE" })
  user: User;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.wishlistItems, { eager: true, onDelete: "CASCADE" })
  product: Product;
}