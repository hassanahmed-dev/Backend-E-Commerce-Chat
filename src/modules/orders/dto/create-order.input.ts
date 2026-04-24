import { InputType, Field } from "@nestjs/graphql";
import { IsArray, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateOrderItemInput } from "./create-order-item.input";

@InputType()
export class CreateOrderInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field(() => [CreateOrderItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemInput)
  items: CreateOrderItemInput[];
}