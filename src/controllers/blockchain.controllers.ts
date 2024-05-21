import { Container } from "typedi";
import { Request, Response, Router } from "express";
import { BlockchainService } from "../services/blockchain.service";
import asyncHandler from "express-async-handler";
import { Server } from "socket.io";

const blockchainService = Container.get(BlockchainService);
export class BlockchainController {
  startListening = asyncHandler(async (req: Request, res: Response) => {
    const io = req.app.get("io") as Server;
    blockchainService.startListening(io);
    res.status(200).json({ message: "Started listening to blockchain events" });
  });
}

export const blockchainController = new BlockchainController();
