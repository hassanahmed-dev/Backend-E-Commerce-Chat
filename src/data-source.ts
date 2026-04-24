import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { Product } from "./entities/product.entity";
import { CartItem } from "./entities/cart-item.entity";
import { WishlistItem } from "./entities/wishlist-item.entity";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";

dotenv.config();

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST ?? process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? process.env.DB_PORT ?? "5432"),
  username: process.env.DATABASE_USERNAME ?? process.env.DB_USER ?? "postgres",
  password: process.env.DATABASE_PASSWORD ?? process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DATABASE_NAME ?? process.env.DB_NAME ?? "ecommerce",
  entities: [User, Product, CartItem, WishlistItem, Order, OrderItem],
  migrations: ["src/migrations/*.ts"],
  synchronize: false
});

