import { Service } from "typedi";
import { ethers } from "ethers";
import { Server } from "socket.io";
import axios from "axios";
import { ETH_RPC_URL } from "../utils/constants";
import { BlockchainEvent } from "../entities/Events.entity";
import { SOCKET_EVENTS } from "../utils/events";
import { AppDataSource } from "../db/data-source";
import ApiError from "../utils/ApiError";

@Service()
export class EventService {
  private latestBlockNumber: number | null = null;

  async getLatestBlockNumber(): Promise<number> {
    try {
      const response = await axios.post(ETH_RPC_URL, {
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      });

      return parseInt(response.data.result, 16);
    } catch (error) {
      console.error("Error fetching the latest block number:", error);
      throw new Error("Failed to fetch the latest block number");
    }
  }
  async getBlockByNumber(value: string) {
    try {
      const blockNumber = parseInt(value, 16);

      const response = await axios.post(ETH_RPC_URL, {
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: [`0x${blockNumber.toString(16)}`, true],
        id: 1,
      });

      return response.data.result;
    } catch (error) {
      console.error(`Error fetching block ${value}:`, error);
      throw new Error(`Failed to fetch block ${value}`);
    }
  }

  async startListening(io: Server, address: string) {
    // Validate the Ethereum address
    if (!ethers.utils.isAddress(address)) {
      throw new ApiError(400, "Invalid Ethereum address");
    }

    try {
      this.latestBlockNumber = await this.getLatestBlockNumber();

      io.on("connection", (socket) => {
        // Join room based on event type
        socket.join(SOCKET_EVENTS.ALL_EVENTS);
        socket.join(SOCKET_EVENTS.SENDER_OR_RECEIVER_EVENTS);
        socket.join(SOCKET_EVENTS.SENDER_EVENTS);
        socket.join(SOCKET_EVENTS.RECEIVER_EVENTS);
        socket.join(SOCKET_EVENTS.VALUE_RANGE.RANGE_0_100);
        socket.join(SOCKET_EVENTS.VALUE_RANGE.RANGE_100_500);
        socket.join(SOCKET_EVENTS.VALUE_RANGE.RANGE_500_2000);
        socket.join(SOCKET_EVENTS.VALUE_RANGE.RANGE_2000_5000);
        socket.join(SOCKET_EVENTS.VALUE_RANGE.RANGE_OVER_5000);
      });

      setInterval(async () => {
        try {
          const currentBlockNumber = await this.getLatestBlockNumber();
          if (
            this.latestBlockNumber &&
            currentBlockNumber > this.latestBlockNumber
          ) {
            for (
              let i = this.latestBlockNumber + 1;
              i <= currentBlockNumber;
              i++
            ) {
              const block = await this.getBlockByNumber(`0x${i.toString(16)}`);
              if (block?.transactions) {
                await this.processBlockTransactions(io, block, address);
              }
            }
            this.latestBlockNumber = currentBlockNumber;
          }
        } catch (error) {
          console.error("Error in block listening interval:", error);
        }
      }, 10000); // delay for 10 seconds
    } catch (error) {
      console.error("Error starting block listening:", error);
    }
  }

  async processBlockTransactions(io: Server, block: any, address: string) {
    for (const tx of block.transactions) {
      const event = {
        sender: tx.from,
        receiver: tx.to,
        blockNumber: parseInt(block.number, 16),
        blockHash: block.hash,
        transactionHash: tx.hash,
        gasPrice: ethers.utils.formatUnits(tx.gasPrice, "gwei"),
        value: ethers.utils.formatUnits(tx.value, 16),
      };

      const ethValue = parseInt(tx.value, 16) / 1e18; // Value in ETH
      const valueInUsd = ethValue * 5000; // Assuming 1 ETH = $5000

      // Always push ALL_EVENTS
      const eventsToStore: string[] = [SOCKET_EVENTS.ALL_EVENTS];

      if (tx.from === address || tx.to === address) {
        // Determine the event types and push to db
        eventsToStore.push(SOCKET_EVENTS.SENDER_OR_RECEIVER_EVENTS);

        if (tx.from === address) {
          eventsToStore.push(SOCKET_EVENTS.SENDER_EVENTS);
        }
        if (tx.to === address) {
          eventsToStore.push(SOCKET_EVENTS.RECEIVER_EVENTS);
        }
        if (valueInUsd > 0 && valueInUsd <= 100) {
          eventsToStore.push(SOCKET_EVENTS.VALUE_RANGE.RANGE_0_100);
        } else if (valueInUsd > 100 && valueInUsd <= 500) {
          eventsToStore.push(SOCKET_EVENTS.VALUE_RANGE.RANGE_100_500);
        } else if (valueInUsd > 500 && valueInUsd <= 2000) {
          eventsToStore.push(SOCKET_EVENTS.VALUE_RANGE.RANGE_500_2000);
        } else if (valueInUsd > 2000 && valueInUsd <= 5000) {
          eventsToStore.push(SOCKET_EVENTS.VALUE_RANGE.RANGE_2000_5000);
        } else if (valueInUsd > 5000) {
          eventsToStore.push(SOCKET_EVENTS.VALUE_RANGE.RANGE_OVER_5000);
        }

        // Store and emit events for each determined type
        for (const eventType of eventsToStore) {
          const blockchainEvent = new BlockchainEvent();

          blockchainEvent.sender = event.sender;
          blockchainEvent.receiver = event.receiver;
          blockchainEvent.blockNumber = event.blockNumber;
          blockchainEvent.blockHash = event.blockHash;
          blockchainEvent.transactionHash = event.transactionHash;
          blockchainEvent.gasPrice = event.gasPrice;
          blockchainEvent.value = event.value;
          blockchainEvent.eventType = eventType;

          await AppDataSource.manager.save(blockchainEvent);
          io.to(eventType).emit(eventType, event);
        }
      }
    }
  }
}
