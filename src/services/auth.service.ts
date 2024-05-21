import { User } from "../entities/User.entity";
import { Service } from "typedi";
import { getRepository } from "typeorm";
import generateHashedPassword from "../helpers/generateHashPassword";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_SECRET_EXPIRY } from "../utils/constants";

@Service()
export class AuthService {
  // private userRepository = getRepository(User);

  register = async (email: string, password: string) => {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }
    const hashedPassword = await generateHashedPassword(password);

    const user = User.create({
      email,
      password: hashedPassword,
    });

    await User.save(user);

    return user;
  };

  login = async (email: string, password: string) => {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid username or password");
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: JWT_SECRET_EXPIRY,
    });
    return { user, token };
  };
}
