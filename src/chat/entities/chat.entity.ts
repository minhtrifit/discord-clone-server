import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  type: string; // direct messages || server messages

  @Column()
  provider: string; // text || image || file

  @Column({ nullable: true, default: null }) // type is direct messages, this collumn store friend id
  friendId: string;

  @Column({ nullable: true, default: null }) // type is server messages, this collumn store server id
  serverId: string;

  @Column({ nullable: true, default: null }) // type is server messages, this collumn store channel id
  channelId: string;

  @Column({ nullable: true, default: null }) // provider is text, this collumn store it
  text: string;

  @Column({ nullable: true, default: null }) // provider is image or file or... have url, this collumn store it
  url: string;

  @Column({ nullable: true, default: null }) // file name (.pdf, .docs, .xlsx,...)
  fileName: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  sended: Date;
}
