import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class AdminChatFilterInput {
  @Field({ nullable: true })
  status?: "open" | "closed";

  @Field({ nullable: true })
  search?: string;
}
