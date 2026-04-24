import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Order } from "../../entities/order.entity";
import { OrdersService } from "./orders.service";
import { CreateOrderInput } from "./dto/create-order.input";

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [Order])
  orders(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Query(() => Order, { nullable: true })
  order(@Args("id") id: string): Promise<Order | null> {
    return this.ordersService.findById(id);
  }

  @Mutation(() => Order)
  createOrder(@Args("input") input: CreateOrderInput): Promise<Order> {
    return this.ordersService.create(input);
  }
}