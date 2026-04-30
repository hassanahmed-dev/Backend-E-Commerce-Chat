import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "../../entities/booking.entity";
import { User } from "../../entities/user.entity";
import { AuthModule } from "../auth/auth.module";
import { BookingsResolver } from "./bookings.resolver";
import { BookingsService } from "./bookings.service";

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User]), AuthModule],
  providers: [BookingsResolver, BookingsService]
})
export class BookingsModule {}
