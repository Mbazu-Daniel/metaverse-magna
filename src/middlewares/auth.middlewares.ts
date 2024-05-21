import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/User.entity";
import { JWT_SECRET } from "../utils/constants";

export const authMiddleware = async (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as {
      id: string;
    };

    const user = await User.findOne({
      where: { id: decodedToken.id },
    });

    if (!user) {
      return res.status(401).send({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};
