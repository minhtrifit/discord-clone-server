import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  serverId: string;

  @Column()
  name: string;

  @Column()
  isPrivate: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created: Date;
}

@Entity()
export class Channel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  categoryId: string;

  @Column()
  name: string;

  @Column()
  type: string; // text | voice

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created: Date;
}
