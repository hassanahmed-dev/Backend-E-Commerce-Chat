import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../../entities/order.entity";
import { OrderItem } from "../../entities/order-item.entity";
import { Product } from "../../entities/product.entity";
import { User } from "../../entities/user.entity";
import { OrdersResolver } from "./orders.resolver";
import { OrdersService } from "./orders.service";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, User])],
  providers: [OrdersResolver, OrdersService]
})
export class OrdersModule {}