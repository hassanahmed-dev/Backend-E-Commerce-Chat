import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "../../entities/user.entity";
import { CreateUserInput } from "./dto/create-user.input";
import { UsersService } from "./users.service";

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { nullable: true })
  user(@Args("id") id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @Mutation(() => User)
  createUser(@Args("input") input: CreateUserInput): Promise<User> {
    return this.usersService.create(input);
  }
}