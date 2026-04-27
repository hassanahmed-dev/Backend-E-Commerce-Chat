import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatSchema1713980000000 implements MigrationInterface {
  name = "AddChatSchema1713980000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "conversations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "status" varchar NOT NULL DEFAULT 'open',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "lastMessageAt" TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "conversation_participants" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "role" varchar NOT NULL DEFAULT 'user',
        "conversationId" uuid,
        "userId" uuid,
        CONSTRAINT "FK_conversation_participants_conversation"
          FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_conversation_participants_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "senderType" varchar NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "conversationId" uuid,
        "senderId" uuid,
        CONSTRAINT "FK_messages_conversation"
          FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_messages_sender"
          FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversation_participants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations"`);
  }
}
