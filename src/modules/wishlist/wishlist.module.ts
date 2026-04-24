import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WishlistItem } from "../../entities/wishlist-item.entity";
import { User } from "../../entities/user.entity";
import { Product } from "../../entities/product.entity";
import { WishlistResolver } from "./wishlist.resolver";
import { WishlistService } from "./wishlist.service";

@Module({
  imports: [TypeOrmModule.forFeature([WishlistItem, User, Product])],
  providers: [WishlistResolver, WishlistService]
})
export class WishlistModule {}