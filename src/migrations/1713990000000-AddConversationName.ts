import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationName1713990000000 implements MigrationInterface {
  name = "AddConversationName1713990000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "name" varchar`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversations" DROP COLUMN IF EXISTS "name"`);
  }
}
