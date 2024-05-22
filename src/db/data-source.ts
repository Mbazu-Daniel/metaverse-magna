import "reflect-metadata";
import { DataSource } from "typeorm";
import { join } from "path";
import {
  DB_HOST,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
  DB_TYPE,
} from "../utils/constants";

const AppDataSource = new DataSource({
  type: DB_TYPE as any,
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: ["src/entities/*.entity.ts"],
  synchronize: true,
  logging: false,
});

export { AppDataSource };
