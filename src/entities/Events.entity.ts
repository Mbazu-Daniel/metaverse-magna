import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class BlockchainEvent extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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
