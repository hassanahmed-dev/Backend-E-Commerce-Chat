import { InputType, Field } from "@nestjs/graphql";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

@InputType()
export class UpdateBookingStatusInput {
  @Field()
  @IsNotEmpty()
  id: string;

  @Field()
  @IsIn(["pending", "confirmed", "cancelled", "completed"])
  status: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
