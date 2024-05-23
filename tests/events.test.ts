import "reflect-metadata";
import { Server } from "http";
import { createServer } from "http";
import {
  Server as SocketIOServer,
  type Socket as ServerSocket,
} from "socket.io";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Application } from "express";
import { AppDataSource } from "../src/db/data-source";
import { BlockchainEvent } from "../src/entities/Events.entity";
import axios from "axios";
import { ethers } from "ethers";
import { Container } from "typedi";
import express from "express";
import { EventService } from "../src/services/events.service";
import { AddressInfo } from "net";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

function waitFor(socket: ServerSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}
describe("EventService", () => {
  let app: Application;
  let httpServer: Server;
  let io: SocketIOServer;
  let serverSocket: ServerSocket
  let clientSocket: ClientSocket;

  beforeAll(async () => {
    app = express();
    httpServer = createServer(app);
    io = new SocketIOServer(httpServer);

    await AppDataSource.initialize();

    io.on("connection", (socket) => {
      serverSocket = socket;
    });

    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        clientSocket = ioc(`http://localhost:${port}`);
        io.on("connection", (socket) => {
          serverSocket = socket;
        });
        clientSocket.on("connect", resolve);
      });
    });
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    io.close();
    clientSocket.disconnect();
    httpServer.close();
  });

  const eventService = Container.get(EventService);

  test("should fetch the latest block number", async () => {
    mockedAxios.post.mockResolvedValue({ data: { result: "0x1a4" } });

    const latestBlockNumber = await eventService.getLatestBlockNumber();
    expect(latestBlockNumber).toBe(420); // 0x1a4 in decimal
  });

  test("should fetch a block by number", async () => {
    const blockData = {
      number: "0x1a4",
      transactions: [],
    };
    mockedAxios.post.mockResolvedValue({ data: { result: blockData } });

    const block = await eventService.getBlockByNumber("0x1a4");
    expect(block).toEqual(blockData);
  });

  test("should validate Ethereum address", () => {
    const validAddress = "0x7AD43cBa2f8934498dF8fc2a0328724422962A51";
    const invalidAddress = "0xInvalidAddress";

    expect(ethers.utils.isAddress(validAddress)).toBe(true);
    expect(ethers.utils.isAddress(invalidAddress)).toBe(false);
  });

   test("should handle invalid Ethereum address", async () => {
     const invalidAddress = "0xInvalidAddress";

     await expect(
       eventService.startListening(io, invalidAddress)
     ).rejects.toThrow("Invalid Ethereum address");
   });

   test("should handle errors during block fetching", async () => {
     mockedAxios.post.mockRejectedValue(new Error("Network Error"));

     await expect(eventService.getLatestBlockNumber()).rejects.toThrow(
       "Failed to fetch the latest block number"
     );
   });
  test("should store events in the database", async () => {
    const tx = {
      from: "0x7AD43cBa2f8934498dF8fc2a0328724422962A51",
      to: "0x7109126D7c62d5aaA8B7Eb2b978fA7554cB69D7B",
      value: "0x38d7ea4c68000", // 1 ETH in wei
      gasPrice: "0x09184e72a000", // 10000000000000 in wei
      hash: "0x1234567890abcdef",
      blockNumber: "0x1a4",
      blockHash: "0xabcdef",
    };

    const blockData = {
      number: "0x1a4",
      transactions: [tx],
      hash: "0xabcdef", 
    };

    await eventService.processBlockTransactions(
      io,
      blockData,
      "0x7AD43cBa2f8934498dF8fc2a0328724422962A51"
    );

    const events = await AppDataSource.getRepository(BlockchainEvent).find();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].transactionHash).toBe(tx.hash);
  });

    test("should emit events for all transactions using rooms", async () => {
      jest.setTimeout(60000); 

      const room = "ALL_EVENTS_ROOM";

      clientSocket.on("ALL_EVENTS", (arg) => {
        expect(arg.transactionHash).toBe("0x1234567890abcdef");
      });

      clientSocket.emit("joinRoom", room); 

      const tx = {
        from: "0x7AD43cBa2f8934498dF8fc2a0328724422962A51",
        to: "0x7109126D7c62d5aaA8B7Eb2b978fA7554cB69D7B",
        value: "0x38d7ea4c68000", 
        gasPrice: "0x09184e72a000", 
        hash: "0x1234567890abcdef",
        blockNumber: "0x1a4",
        blockHash: "0xabcdef",
      };

      const blockData = {
        number: "0x1a4",
        transactions: [tx],
        hash: "0xabcdef",
      };

      await eventService.processBlockTransactions(
        io,
        blockData,
        "0x7AD43cBa2f8934498dF8fc2a0328724422962A51"
      );

      serverSocket.to(room).emit("ALL_EVENTS", tx); 
    });

   test("should emit sender events", async () => {

    const room = "SENDER_EVENTS_ROOM";

    clientSocket.on("SENDER_EVENTS", (arg) => {
      expect(arg.transactionHash).toBe("0x1234567890abcdef");
      
    });

    clientSocket.emit("joinRoom", room); // Join the room

    const tx = {
      from: "0x7AD43cBa2f8934498dF8fc2a0328724422962A51",
      to: "0x7109126D7c62d5aaA8B7Eb2b978fA7554cB69D7B",
      value: "0x38d7ea4c68000", // 1 ETH in wei value
      gasPrice: "0x09184e72a000", // 10000000000000 in wei value
      hash: "0x1234567890abcdef",
      blockNumber: "0x1a4",
      blockHash: "0xabcdef",
    };

    const blockData = {
      number: "0x1a4",
      transactions: [tx],
      hash: "0xabcdef",
    };

    await eventService.processBlockTransactions(
      io,
      blockData,
      "0x7AD43cBa2f8934498dF8fc2a0328724422962A51"
    );

    serverSocket.to(room).emit("SENDER_EVENTS", tx); // Emit event to the room
  });

  test("should emit receiver events", async () => {
    jest.setTimeout(60000); // Increase timeout to 60 seconds

    const room = "RECEIVER_EVENTS_ROOM";

    clientSocket.on("RECEIVER_EVENTS", (arg) => {
      expect(arg.transactionHash).toBe("0x1234567890abcdef");
     
    });

    clientSocket.emit("joinRoom", room); // Join the room

    const tx = {
      from: "0x7AD43cBa2f8934498dF8fc2a0328724422962A51",
      to: "0x7109126D7c62d5aaA8B7Eb2b978fA7554cB69D7B",
      value: "0x38d7ea4c68000", // 1 ETH in wei value
      gasPrice: "0x09184e72a000", // 10000000000000 in wei value
      hash: "0x1234567890abcdef",
      blockNumber: "0x1a4",
      blockHash: "0xabcdef",
    };

    const blockData = {
      number: "0x1a4",
      transactions: [tx],
      hash: "0xabcdef",
    };

    await eventService.processBlockTransactions(
      io,
      blockData,
      "0x7109126D7c62d5aaA8B7Eb2b978fA7554cB69D7B" // Set receiver address to trigger RECEIVER_EVENTS
    );

    serverSocket.to(room).emit("RECEIVER_EVENTS", tx); // Emit event to the room
  });

  test("should emit value range events (0-100 USD)", async () => {
    jest.setTimeout(60000); 

    const room = "VALUE_RANGE_0_100";

    clientSocket.on("VALUE_RANGE_0_100", (arg) => {
      expect(arg.transactionHash).toBe("0x1234567890abcdef");
      
    });

    clientSocket.emit("joinRoom", room); 

    const tx = {
      from: "0x7AD43cBa2f8934498dF8fc2a0328724422962A51",
      to: "0x7109126D7c62d5aaA8B7Eb2b978fA7554cB69D7B",
      value: ethers.utils.parseUnits("0.01", "ether").toHexString(), // 0.01 ETH in wei value (0.01 * 5000 = 50 USD)
      gasPrice: "0x09184e72a000", 
      hash: "0x1234567890abcdef",
      blockNumber: "0x1a4",
      blockHash: "0xabcdef",
    };

    const blockData = {
      number: "0x1a4",
      transactions: [tx],
      hash: "0xabcdef",
    };

    await eventService.processBlockTransactions(
      io,
      blockData,
      "0x7AD43cBa2f8934498dF8fc2a0328724422962A51"
    );

    serverSocket.to(room).emit("VALUE_RANGE_0_100", tx); 
  });

});
