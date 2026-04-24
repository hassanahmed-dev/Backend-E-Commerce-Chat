import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "../../entities/product.entity";
import { AuthModule } from "../auth/auth.module";
import { ProductsResolver } from "./products.resolver";
import { ProductsService } from "./products.service";

@Module({
  imports: [TypeOrmModule.forFeature([Product]), AuthModule],
  providers: [ProductsResolver, ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}