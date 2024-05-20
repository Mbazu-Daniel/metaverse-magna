import { User } from "../entities/User.entity";
import generateHashedPassword from "../helpers/generateHashPassword";

export const registerUser = async (email: string, password: string) => {
  const hashedPassword = await generateHashedPassword(password);

  const newUser = User.create({ email, password: hashedPassword });

  await newUser.save();

  return newUser;
};

