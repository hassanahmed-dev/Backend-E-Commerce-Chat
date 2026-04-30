import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "../../entities/booking.entity";
import { User } from "../../entities/user.entity";
import { CreateBookingInput } from "./dto/create-booking.input";
import { UpdateBookingStatusInput } from "./dto/update-booking-status.input";

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create(userId: string, input: CreateBookingInput): Promise<Booking> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const booking = this.bookingsRepository.create({
      user,
      serviceType: input.serviceType,
      scheduledAt: new Date(input.scheduledAt),
      userNote: input.userNote ?? null,
      status: "pending"
    });

    return this.bookingsRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find({ order: { scheduledAt: "ASC" } });
  }

  async findByUser(userId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { user: { id: userId } },
      order: { scheduledAt: "ASC" }
    });
  }

  async findById(id: string): Promise<Booking | null> {
    return this.bookingsRepository.findOne({ where: { id } });
  }

  async updateStatus(input: UpdateBookingStatusInput): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({ where: { id: input.id } });
    if (!booking) throw new NotFoundException("Booking not found");

    booking.status = input.status;
    if (input.adminNote !== undefined) {
      booking.adminNote = input.adminNote ?? null;
    }

    return this.bookingsRepository.save(booking);
  }

  async cancel(id: string, userId: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id, user: { id: userId } }
    });
    if (!booking) throw new NotFoundException("Booking not found");

    booking.status = "cancelled";
    return this.bookingsRepository.save(booking);
  }
}
