import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBalanceFlightCancelSlug1717000000000 implements MigrationInterface {
  name = 'AddBalanceFlightCancelSlug1717000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "balance" numeric(10,2) NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "flights" ADD "cancelReason" text`);
    await queryRunner.query(`ALTER TABLE "news" ADD "slug" character varying(220)`);
    await queryRunner.query(`UPDATE "news" SET "slug" = lower(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g'))`);
    await queryRunner.query(`UPDATE "news" SET "slug" = concat("slug", '-', row_number) FROM (
        SELECT id, row_number() OVER (PARTITION BY slug ORDER BY "createdAt") AS row_number
        FROM "news"
      ) AS dup
      WHERE "news".id = dup.id AND dup.row_number > 1`);
    await queryRunner.query(`UPDATE "news" SET "slug" = concat('news-', substr(id::text, 1, 8)) WHERE "slug" IS NULL OR "slug" = ''`);
    await queryRunner.query(`ALTER TABLE "news" ALTER COLUMN "slug" SET NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_news_slug" ON "news" ("slug")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_news_slug"`);
    await queryRunner.query(`ALTER TABLE "news" DROP COLUMN "slug"`);
    await queryRunner.query(`ALTER TABLE "flights" DROP COLUMN "cancelReason"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "balance"`);
  }
}
