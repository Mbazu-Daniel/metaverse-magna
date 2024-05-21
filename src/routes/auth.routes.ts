import { Router } from "express";
import { Container } from "typedi";
import { authController } from "../controllers/auth.controllers";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

export default authRouter;
