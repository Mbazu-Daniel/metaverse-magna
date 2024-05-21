import "reflect-metadata";
import { DataSource } from "typeorm";
import {
  DB_HOST,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
} from "../utils/constants";
const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: ["src/entities/*.ts"],
  synchronize: true,
  logging: false,
});

export { AppDataSource };
