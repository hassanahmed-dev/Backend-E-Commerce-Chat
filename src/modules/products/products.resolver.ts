import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Product } from "../../entities/product.entity";
import { AuthService } from "../auth/auth.service";
import { CreateProductInput } from "./dto/create-product.input";
import { UpdateProductInput } from "./dto/update-product.input";
import { ProductsService } from "./products.service";

@Resolver(() => Product)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly authService: AuthService
  ) {}

  @Query(() => [Product])
  products(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Query(() => Product, { nullable: true })
  product(@Args("id") id: string): Promise<Product | null> {
    return this.productsService.findById(id);
  }

  @Mutation(() => Product)
  async createProduct(
    @Args("input") input: CreateProductInput,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Product> {
    await this.assertAdmin(authorization);
    return this.productsService.create(input);
  }

  @Mutation(() => [Product])
  async createProducts(
    @Args({ name: "inputs", type: () => [CreateProductInput] }) inputs: CreateProductInput[],
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Product[]> {
    await this.assertAdmin(authorization);
    return this.productsService.createMany(inputs);
  }

  @Mutation(() => Product)
  async updateProduct(
    @Args("id") id: string,
    @Args("input") input: UpdateProductInput,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Product> {
    await this.assertAdmin(authorization);
    return this.productsService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteProduct(
    @Args("id") id: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<boolean> {
    await this.assertAdmin(authorization);
    return this.productsService.delete(id);
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