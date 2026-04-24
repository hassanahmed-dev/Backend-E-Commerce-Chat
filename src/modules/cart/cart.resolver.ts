import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CartItem } from "../../entities/cart-item.entity";
import { AddCartItemInput } from "./dto/add-cart-item.input";
import { CartService } from "./cart.service";

@Resolver(() => CartItem)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => [CartItem])
  cartItems(@Args("userId") userId: string): Promise<CartItem[]> {
    return this.cartService.items(userId);
  }

  @Mutation(() => CartItem)
  addCartItem(@Args("input") input: AddCartItemInput): Promise<CartItem> {
    return this.cartService.addItem(input);
  }

  @Mutation(() => Boolean)
  removeCartItem(@Args("id") id: string): Promise<boolean> {
    return this.cartService.removeItem(id);
  }
}