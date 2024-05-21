import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_SECRET_EXPIRY = process.env.JWT_SECRET_EXPIRY;
const PORT = process.env.PORT;
const ETH_RPC_URL = process.env.ETH_RPC_URL;

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

export {
  JWT_SECRET,
  JWT_SECRET_EXPIRY,
  PORT,
  ETH_RPC_URL,
  DB_HOST,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
};
