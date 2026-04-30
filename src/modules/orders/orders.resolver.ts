import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Order } from "../../entities/order.entity";
import { AuthService } from "../auth/auth.service";
import { OrdersService } from "./orders.service";
import { CreateOrderInput } from "./dto/create-order.input";

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly authService: AuthService
  ) {}

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

  @Mutation(() => Order)
  async updateOrderStatus(
    @Args("id") id: string,
    @Args("status") status: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Order> {
    await this.assertAdmin(authorization);
    return this.ordersService.updateStatus(id, status);
  }

  private async assertAdmin(authorization: string): Promise<void> {
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }
    const token = authorization.replace("Bearer ", "").trim();
    const payload = await this.authService.verifyToken(token);
    if (payload.role !== "admin") {
      throw new ForbiddenException("Admin access required");
    }
  }
}