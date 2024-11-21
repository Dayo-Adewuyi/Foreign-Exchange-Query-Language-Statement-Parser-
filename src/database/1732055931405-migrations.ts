import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1732055931405 implements MigrationInterface {
  name = 'Migrations1732055931405';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "fx_rates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_currency" character varying(3) NOT NULL, "destination_currency" character varying(3) NOT NULL, "buy_price" numeric(18,8) NOT NULL, "sell_price" numeric(18,8) NOT NULL, "cap_amount" bigint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_94eb17e7eddb6df0cec5985ea5f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9fb1e92b8dda9d974c5e1ac003" ON "fx_rates" ("source_currency", "destination_currency") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9fb1e92b8dda9d974c5e1ac003"`,
    );
    await queryRunner.query(`DROP TABLE "fx_rates"`);
  }
}
