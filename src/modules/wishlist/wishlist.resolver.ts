import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { WishlistItem } from "../../entities/wishlist-item.entity";
import { WishlistService } from "./wishlist.service";
import { AddWishlistItemInput } from "./dto/add-wishlist-item.input";

@Resolver(() => WishlistItem)
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}

  @Query(() => [WishlistItem])
  wishlistItems(@Args("userId") userId: string): Promise<WishlistItem[]> {
    return this.wishlistService.items(userId);
  }

  @Mutation(() => WishlistItem)
  addWishlistItem(@Args("input") input: AddWishlistItemInput): Promise<WishlistItem> {
    return this.wishlistService.addItem(input);
  }

  @Mutation(() => Boolean)
  removeWishlistItem(@Args("id") id: string): Promise<boolean> {
    return this.wishlistService.removeItem(id);
  }
}