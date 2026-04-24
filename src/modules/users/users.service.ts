import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "../../entities/user.entity";
import { CreateUserInput } from "./dto/create-user.input";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : "";
    const user = this.usersRepository.create({
      email: input.email,
      name: input.name,
      role: input.role ?? "user",
      passwordHash
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { name: "ASC" } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
}