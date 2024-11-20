import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateFxRatesTable1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.createTable(
            new Table({
                name: "fx_rates",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "source_currency",
                        type: "varchar",
                        length: "3",
                        isNullable: false
                    },
                    {
                        name: "destination_currency",
                        type: "varchar",
                        length: "3",
                        isNullable: false
                    },
                    {
                        name: "buy_price",
                        type: "decimal",
                        precision: 18,
                        scale: 8,
                        isNullable: false
                    },
                    {
                        name: "sell_price",
                        type: "decimal",
                        precision: 18,
                        scale: 8,
                        isNullable: false
                    },
                    {
                        name: "cap_amount",
                        type: "bigint",
                        isNullable: false
                    },
                    {
                        name: "created_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP"
                    }
                ],
                indices: [
                    {
                        name: "idx_fx_rates_currency_pair",
                        columnNames: ["source_currency", "destination_currency"]
                    },
                    {
                        name: "idx_fx_rates_created_at",
                        columnNames: ["created_at"]
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("fx_rates");
    }
}