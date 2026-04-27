import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class CreateSupportConversationInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  userEmail?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  initialMessage?: string;
}
