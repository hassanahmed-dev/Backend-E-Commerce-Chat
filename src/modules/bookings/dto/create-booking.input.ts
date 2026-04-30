import { InputType, Field } from "@nestjs/graphql";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

@InputType()
export class CreateBookingInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  serviceType: string;

  @Field()
  @IsDateString()
  scheduledAt: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userNote?: string;
}
