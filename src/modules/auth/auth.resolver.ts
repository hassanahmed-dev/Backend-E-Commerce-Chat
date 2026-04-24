import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { AuthPayload } from "./dto/auth-payload.type";
import { LoginInput } from "./dto/login.input";
import { SignupInput } from "./dto/signup.input";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  signup(@Args("input") input: SignupInput): Promise<AuthPayload> {
    return this.authService.signup(input);
  }

  @Mutation(() => AuthPayload)
  login(@Args("input") input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }
}

