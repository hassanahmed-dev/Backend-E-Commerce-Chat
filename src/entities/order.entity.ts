import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { OrderItem } from "./order-item.entity";

@ObjectType()
@Entity("orders")
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({ default: "pending" })
  status: string;

  @Field(() => Float)
  @Column({ type: "numeric", precision: 10, scale: 2, default: 0 })
  total: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.orders, { eager: true, onDelete: "CASCADE" })
  user: User;

  @Field(() => [OrderItem], { nullable: true })
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];
}