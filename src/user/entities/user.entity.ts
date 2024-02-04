import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  provider: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true, default: null })
  password: string;

  @Column({ nullable: true, default: null })
  avatar: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created: Date;
}

@Entity()
export class FriendPending {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  senderEmail: string;

  @Column()
  receiverEmail: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  dateSended: Date;
}
