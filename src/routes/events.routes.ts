import { Router } from "express";
import { blockchainController } from "../controllers/events.controllers";
import { authMiddleware } from "../middlewares/auth.middlewares";

const blockchainRouter = Router();

// authenticate user
blockchainRouter.use(authMiddleware);

blockchainRouter.get("/start", blockchainController.startListening);

export default blockchainRouter;
