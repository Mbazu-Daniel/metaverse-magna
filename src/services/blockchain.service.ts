import { Service } from "typedi";
import { ethers } from "ethers";
import { Server } from "socket.io";
import axios from "axios";
import { ETH_RPC_URL } from "../utils/constants";


@Service()
export class BlockchainService {
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

  async startListening(io: Server) {
    this.latestBlockNumber = await this.getLatestBlockNumber();

    setInterval(async () => {
      const currentBlockNumber = await this.getLatestBlockNumber();
      if (
        this.latestBlockNumber &&
        currentBlockNumber > this.latestBlockNumber
      ) {
        for (let i = this.latestBlockNumber + 1; i <= currentBlockNumber; i++) {
          const block = await this.getBlockByNumber(`0x${i.toString(16)}`);
          if (block?.transactions) {
            for (const tx of block.transactions) {
              const event = {
                sender: tx.from,
                receiver: tx.to,
                blockNumber: parseInt(block.number, 16),
                blockHash: block.hash,
                transactionHash: tx.hash,
                gasPrice: ethers.utils.formatUnits(tx.gasPrice, "gwei"),
                value: tx.value,
              };
              console.log(
                "🚀 ~ BlockchainService ~ setInterval ~ event:",
                event
              );
            }
          }
        }
        this.latestBlockNumber = currentBlockNumber;
      }
    }, 10000); 
  }
}
