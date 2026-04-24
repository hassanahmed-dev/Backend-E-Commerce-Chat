import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1713970000000 implements MigrationInterface {
  name = "InitSchema1713970000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL UNIQUE,
        "name" varchar NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "role" varchar NOT NULL DEFAULT 'user',
        "passwordHash" varchar NOT NULL DEFAULT ''
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" text NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "stock" integer NOT NULL DEFAULT 0,
        "category" varchar NOT NULL,
        "imageUrl" varchar NOT NULL DEFAULT '',
        "rating" numeric(3,2) NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "status" varchar NOT NULL DEFAULT 'pending',
        "total" numeric(10,2) NOT NULL DEFAULT 0,
        "userId" uuid,
        CONSTRAINT "FK_orders_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL DEFAULT 1,
        "unitPrice" numeric(10,2) NOT NULL,
        "productId" uuid,
        "orderId" uuid,
        CONSTRAINT "FK_order_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cart_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL DEFAULT 1,
        "userId" uuid,
        "productId" uuid,
        CONSTRAINT "FK_cart_items_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "wishlist_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "productId" uuid,
        CONSTRAINT "FK_wishlist_items_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_wishlist_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" varchar NOT NULL DEFAULT 'user'`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" varchar NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "imageUrl" varchar NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "rating" numeric(3,2) NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlist_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cart_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}

