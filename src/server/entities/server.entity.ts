import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Server {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  owner: string; // userid

  @Column({ nullable: true, default: null })
  avatar: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created: Date;
}

@Entity()
export class JoinServer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  serverId: string;

  @Column()
  userId: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  joinedDate: Date;
}
