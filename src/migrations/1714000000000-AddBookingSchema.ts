import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookingSchema1714000000000 implements MigrationInterface {
  name = "AddBookingSchema1714000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bookings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "serviceType" varchar NOT NULL,
        "scheduledAt" timestamptz NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "userNote" text DEFAULT NULL,
        "adminNote" text DEFAULT NULL,
        "userId" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_bookings_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
  }
}
