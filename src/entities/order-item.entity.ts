import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "./product.entity";

@ObjectType()
@Entity("order_items")
export class OrderItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => Int)
  @Column({ default: 1 })
  quantity: number;

  @Field(() => Float)
  @Column({ type: "numeric", precision: 10, scale: 2 })
  unitPrice: number;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.orderItems, { eager: true })
  product: Product;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  order: Order;
}