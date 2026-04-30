import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Booking } from "../../entities/booking.entity";
import { AuthService } from "../auth/auth.service";
import { CreateBookingInput } from "./dto/create-booking.input";
import { UpdateBookingStatusInput } from "./dto/update-booking-status.input";
import { BookingsService } from "./bookings.service";

@Resolver(() => Booking)
export class BookingsResolver {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly authService: AuthService
  ) {}

  @Query(() => [Booking])
  async bookings(
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Booking[]> {
    await this.assertAdmin(authorization);
    return this.bookingsService.findAll();
  }

  @Query(() => [Booking])
  async myBookings(
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Booking[]> {
    const payload = await this.verifyToken(authorization);
    return this.bookingsService.findByUser(payload.sub);
  }

  @Mutation(() => Booking)
  async createBooking(
    @Args("input") input: CreateBookingInput,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Booking> {
    const payload = await this.verifyToken(authorization);
    return this.bookingsService.create(payload.sub, input);
  }

  @Mutation(() => Booking)
  async updateBookingStatus(
    @Args("input") input: UpdateBookingStatusInput,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Booking> {
    await this.assertAdmin(authorization);
    return this.bookingsService.updateStatus(input);
  }

  @Mutation(() => Booking)
  async cancelBooking(
    @Args("id") id: string,
    @Args("authorization", { type: () => String }) authorization: string
  ): Promise<Booking> {
    const payload = await this.verifyToken(authorization);
    return this.bookingsService.cancel(id, payload.sub);
  }

  private async verifyToken(authorization: string): Promise<{ sub: string; email: string; role: string }> {
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }
    const token = authorization.replace("Bearer ", "").trim();
    return this.authService.verifyToken(token);
  }

  private async assertAdmin(authorization: string): Promise<void> {
    const payload = await this.verifyToken(authorization);
    if (payload.role !== "admin") {
      throw new ForbiddenException("Admin access required");
    }
  }
}
