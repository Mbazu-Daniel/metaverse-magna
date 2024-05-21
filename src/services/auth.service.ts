import { User } from "../entities/User.entity";
import { Service } from "typedi";

import generateHashedPassword from "../utils/generateHashPassword";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_SECRET_EXPIRY } from "../utils/constants";
import { AppDataSource } from "../db/data-source";

@Service()
export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  register = async (email: string, password: string) => {
    // Check if the user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }
    const hashedPassword = await generateHashedPassword(password);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return user;
  };

  login = async (email: string, password: string) => {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid username or password");
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: JWT_SECRET_EXPIRY,
    });

    return { user, token };
  };
}
