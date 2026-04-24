import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartItem } from "../../entities/cart-item.entity";
import { User } from "../../entities/user.entity";
import { Product } from "../../entities/product.entity";
import { CartResolver } from "./cart.resolver";
import { CartService } from "./cart.service";

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, User, Product])],
  providers: [CartResolver, CartService]
})
export class CartModule {}