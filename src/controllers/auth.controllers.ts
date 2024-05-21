import { Container } from "typedi";
import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import { AuthService } from "../services/auth.service";
import ApiError from "../utils/ApiError";

const authService = Container.get(AuthService);

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await authService.register(email, password);
      res.status(200).json(user);
    } catch (error) {
      throw new ApiError(400, "User registration failed");
    }
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.send({ user, token });
    } catch (error) {
      throw new ApiError(400, "email or password is incorrect");
    
    }
  });
}

export const authController = new AuthController();
