import { DataSource, DataSourceOptions } from "typeorm";
import { config } from 'dotenv';
import { join } from 'path';
import { FxRateEntity } from "../core/domain/entities/fx-rate.entity";

config(); 

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [FxRateEntity],
  migrations: [join(__dirname, '../../database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

export default new DataSource(options);