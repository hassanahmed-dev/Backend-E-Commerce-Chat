import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../../entities/order.entity";
import { OrderItem } from "../../entities/order-item.entity";
import { Product } from "../../entities/product.entity";
import { User } from "../../entities/user.entity";
import { AuthModule } from "../auth/auth.module";
import { OrdersResolver } from "./orders.resolver";
import { OrdersService } from "./orders.service";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, User]), AuthModule],
  providers: [OrdersResolver, OrdersService]
})
export class OrdersModule {}