import { InputType, Field } from "@nestjs/graphql";
import { IsUUID } from "class-validator";

@InputType()
export class AddWishlistItemInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field()
  @IsUUID()
  productId: string;
}