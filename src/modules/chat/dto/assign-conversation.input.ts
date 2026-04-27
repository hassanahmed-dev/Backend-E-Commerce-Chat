import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class AssignConversationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  adminId: string;
}
