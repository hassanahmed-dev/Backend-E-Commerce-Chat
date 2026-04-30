import { ForbiddenException, forwardRef, Inject, UnauthorizedException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "../../entities/user.entity";
import { AuthService } from "../auth/auth.service";
import { CreateUserInput } from "./dto/create-user.input";
import { UsersService } from "./users.service";

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  @Query(() => [User])
  users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => [User])
  async getAllUsers(
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<User[]> {
    await this.assertAdmin(authorization);
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

  @Mutation(() => User)
  async toggleUserActive(
    @Args("id") id: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<User> {
    await this.assertAdmin(authorization);
    return this.usersService.toggleActive(id);
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