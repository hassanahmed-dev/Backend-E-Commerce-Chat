import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, IsIn, IsNotEmpty, IsOptional, MinLength } from "class-validator";

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsIn(["user", "admin"])
  role?: "user" | "admin";
}