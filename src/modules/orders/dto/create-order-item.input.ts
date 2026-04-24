import { InputType, Field, Int } from "@nestjs/graphql";
import { IsInt, IsUUID, Min } from "class-validator";

@InputType()
export class CreateOrderItemInput {
  @Field()
  @IsUUID()
  productId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}