import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class CreateAdminConversationInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  chatName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  initialMessage?: string;
}
