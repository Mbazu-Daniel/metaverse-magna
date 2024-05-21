import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { IsEmail, MinLength } from "class-validator";
@Entity()
export class User extends BaseEntity {
  
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @IsEmail()
  email!: string;

  @Column()
  @MinLength(6)
  password!: string;
}
