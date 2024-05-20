import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_SECRET_EXPIRY = process.env.JWT_SECRET_EXPIRY;

export { JWT_SECRET, JWT_SECRET_EXPIRY };
