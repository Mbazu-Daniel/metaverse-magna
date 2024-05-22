import "reflect-metadata";
import { Container } from "typedi";
import { Request, Response, Router } from "express";
import { BlockchainService } from "../services/events.service";
import asyncHandler from "express-async-handler";
import { Server } from "socket.io";

const blockchainService = Container.get(BlockchainService);
export class BlockchainController {
  startListening = asyncHandler(async (req: Request, res: Response) => {
    const address = req.query.address as string | undefined;

    if (!address) {
      res
        .status(400)
        .json({ message: "Address is required and must be a string" });
      return;
    }
    const io = req.app.get("io") as Server;
    blockchainService.startListening(io, address);
    res.status(200).json({ message: "Started listening to blockchain events" });
  });
}

export const blockchainController = new BlockchainController();
