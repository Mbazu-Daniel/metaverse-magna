import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/User.entity";
import { JWT_SECRET } from "../utils/constants";

import ApiError from "../utils/ApiError";

export const authMiddleware = async (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction
) => {
  const bearerToken = req.headers.authorization?.split(" ")[1];
   const cookiesToken = req.cookies.access_token;
  // const token = bearerToken || cookiesToken;
  const token = cookiesToken || bearerToken;
 

  if (!token) {
    throw new ApiError(401, "You're not logged in ")
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as {
      id: string;
    };

    const user = await User.findOne({
      where: { id: decodedToken.id },
    });

    if (!user) {
      throw new ApiError(401, "Invalid User")
      
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid Token");
  }
};
