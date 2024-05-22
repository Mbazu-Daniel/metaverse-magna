import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class BlockchainEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sender!: string;

  @Column()
  receiver!: string;

  @Column()
  blockNumber!: number;

  @Column()
  blockHash!: string;

  @Column()
  transactionHash!: string;

  @Column()
  gasPrice!: string;

  @Column()
  value!: string;

  @Column()
  eventType!: string;
}
