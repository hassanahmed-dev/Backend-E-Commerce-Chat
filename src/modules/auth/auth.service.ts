import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { User } from "../../entities/user.entity";
import { UsersService } from "../users/users.service";
import { LoginInput } from "./dto/login.input";
import { SignupInput } from "./dto/signup.input";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signup(input: SignupInput): Promise<{ accessToken: string; user: User }> {
    const existing = await this.usersService.findByEmail(input.email);
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const user = await this.usersService.create({
      email: input.email,
      name: input.name,
      password: input.password,
      role: "user"
    });

    return {
      accessToken: await this.signToken(user),
      user
    };
  }

  async login(input: LoginInput): Promise<{ accessToken: string; user: User }> {
    const user = await this.usersService.findByEmail(input.email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      accessToken: await this.signToken(user),
      user
    };
  }

  private async signToken(user: User): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });
  }

  async verifyToken(token: string): Promise<{ sub: string; email: string; role: string }> {
    return this.jwtService.verifyAsync(token);
  }
}

