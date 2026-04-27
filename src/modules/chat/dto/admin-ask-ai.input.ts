import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class AdminAskAiInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
