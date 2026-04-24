import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../../entities/product.entity";
import { CreateProductInput } from "./dto/create-product.input";

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
}