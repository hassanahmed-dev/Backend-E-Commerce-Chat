import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartModule } from "./modules/cart/cart.module";
import { WishlistModule } from "./modules/wishlist/wishlist.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { ChatModule } from "./modules/chat/chat.module";
import { BookingsModule } from "./modules/bookings/bookings.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      playground: true
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DATABASE_HOST") ?? configService.get<string>("DB_HOST", "localhost"),
        port: Number(configService.get<string>("DATABASE_PORT") ?? configService.get<string>("DB_PORT", "5432")),
        username: configService.get<string>("DATABASE_USERNAME") ?? configService.get<string>("DB_USER", "postgres"),
        password: configService.get<string>("DATABASE_PASSWORD") ?? configService.get<string>("DB_PASSWORD", "postgres"),
        database: configService.get<string>("DATABASE_NAME") ?? configService.get<string>("DB_NAME", "ecommerce"),
        autoLoadEntities: true,
        synchronize:
          (configService.get<string>("DB_SYNC") ??
            configService.get<string>("DATABASE_SYNC") ??
            "false") === "true"
      })
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    WishlistModule,
    OrdersModule,
    ChatModule,
    BookingsModule
  ]
})
export class AppModule {}