import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WishlistItem } from "../../entities/wishlist-item.entity";
import { User } from "../../entities/user.entity";
import { Product } from "../../entities/product.entity";
import { AddWishlistItemInput } from "./dto/add-wishlist-item.input";

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>
  ) {}

  async addItem(input: AddWishlistItemInput): Promise<WishlistItem> {
    const user = await this.usersRepository.findOne({ where: { id: input.userId } });
    const product = await this.productsRepository.findOne({ where: { id: input.productId } });

    if (!user || !product) {
      throw new NotFoundException("User or product not found");
    }

    const item = this.wishlistRepository.create({ user, product });
    return this.wishlistRepository.save(item);
  }

  async items(userId: string): Promise<WishlistItem[]> {
    return this.wishlistRepository.find({ where: { user: { id: userId } } });
  }

  async removeItem(id: string): Promise<boolean> {
    const result = await this.wishlistRepository.delete({ id });
    return Boolean(result.affected);
  }
}