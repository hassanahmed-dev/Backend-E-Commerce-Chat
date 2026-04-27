import { Field, ObjectType } from "@nestjs/graphql";
import { Message } from "../../../entities/message.entity";

@ObjectType()
export class AdminAiResponse {
  @Field(() => Message)
  adminMessage: Message;

  @Field(() => Message)
  aiMessage: Message;
}
