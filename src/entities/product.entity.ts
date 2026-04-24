import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CartItem } from "./cart-item.entity";
import { WishlistItem } from "./wishlist-item.entity";
import { OrderItem } from "./order-item.entity";

@ObjectType()
@Entity("products")
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ type: "text" })
  description: string;

  @Field(() => Float)
  @Column({ type: "numeric", precision: 10, scale: 2 })
  price: number;

  @Field()
  @Column({ default: 0 })
  stock: number;

  @Field()
  @Column()
  category: string;

  @Field({ nullable: true })
  @Column({ default: "" })
  imageUrl: string;

  @Field(() => Float)
  @Column({ type: "numeric", precision: 3, scale: 2, default: 0 })
  rating: number;

  @OneToMany(() => CartItem, (item) => item.product)
  cartItems: CartItem[];

  @OneToMany(() => WishlistItem, (item) => item.product)
  wishlistItems: WishlistItem[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];
}