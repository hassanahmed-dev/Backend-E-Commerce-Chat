import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../../entities/order.entity";
import { OrderItem } from "../../entities/order-item.entity";
import { Product } from "../../entities/product.entity";
import { User } from "../../entities/user.entity";
import { CreateOrderInput } from "./dto/create-order.input";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create(input: CreateOrderInput): Promise<Order> {
    const user = await this.usersRepository.findOne({ where: { id: input.userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const items: OrderItem[] = [];
    let total = 0;

    for (const item of input.items) {
      const product = await this.productsRepository.findOne({ where: { id: item.productId } });
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      const orderItem = this.orderItemsRepository.create({
        product,
        quantity: item.quantity,
        unitPrice: Number(product.price)
      });

      items.push(orderItem);
      total += Number(product.price) * item.quantity;
    }

    const order = this.ordersRepository.create({
      user,
      items,
      total,
      status: "pending"
    });

    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({ order: { id: "DESC" } });
  }

  async findById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { id } });
  }
}