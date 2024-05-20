import { User } from "../entities/User.entity";
import generateHashedPassword from "../helpers/generateHashPassword";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_SECRET_EXPIRY } from "../utils/constants";

export const registerUser = async (email: string, password: string) => {
  const hashedPassword = await generateHashedPassword(password);

  const user = User.create({ email, password: hashedPassword });

  await user.save();

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid username or password");
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: JWT_SECRET_EXPIRY,
  });

  await user.save();
  return { user, token };
};
