import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class AdminSendMessageInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;
}
