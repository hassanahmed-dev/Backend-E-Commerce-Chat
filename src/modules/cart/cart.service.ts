import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CartItem } from "../../entities/cart-item.entity";
import { User } from "../../entities/user.entity";
import { Product } from "../../entities/product.entity";
import { AddCartItemInput } from "./dto/add-cart-item.input";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>
  ) {}

  async addItem(input: AddCartItemInput): Promise<CartItem> {
    const user = await this.usersRepository.findOne({ where: { id: input.userId } });
    const product = await this.productsRepository.findOne({ where: { id: input.productId } });

    if (!user || !product) {
      throw new NotFoundException("User or product not found");
    }

    const item = this.cartRepository.create({ user, product, quantity: input.quantity });
    return this.cartRepository.save(item);
  }

  async items(userId: string): Promise<CartItem[]> {
    return this.cartRepository.find({ where: { user: { id: userId } } });
  }

  async removeItem(id: string): Promise<boolean> {
    const result = await this.cartRepository.delete({ id });
    return Boolean(result.affected);
  }
}