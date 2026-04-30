import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../../entities/product.entity";
import { CreateProductInput } from "./dto/create-product.input";
import { UpdateProductInput } from "./dto/update-product.input";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>
  ) {}

  async create(input: CreateProductInput): Promise<Product> {
    const product = this.productsRepository.create(input);
    return this.productsRepository.save(product);
  }

  async createMany(inputs: CreateProductInput[]): Promise<Product[]> {
    const products = this.productsRepository.create(inputs);
    return this.productsRepository.save(products);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({ order: { name: "ASC" } });
  }

  async findById(id: string): Promise<Product | null> {
    return this.productsRepository.findOne({ where: { id } });
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    Object.assign(product, input);
    return this.productsRepository.save(product);
  }

  async delete(id: string): Promise<boolean> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    await this.productsRepository.remove(product);
    return true;
  }
}