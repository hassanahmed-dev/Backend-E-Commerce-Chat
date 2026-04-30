import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@ObjectType()
@Entity("bookings")
export class Booking {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  serviceType: string;

  @Field()
  @Column({ type: "timestamptz" })
  scheduledAt: Date;

  @Field()
  @Column({ default: "pending" })
  status: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true, default: null })
  userNote: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "text", nullable: true, default: null })
  adminNote: string | null;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true, onDelete: "CASCADE" })
  user: User;

  @Field()
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
