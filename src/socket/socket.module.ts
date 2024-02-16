import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { SocketGateway } from "./socket.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  User,
  Friend,
  FriendPending,
  DirectMessage,
  Server,
  JoinServer,
} from "src/entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Friend,
      FriendPending,
      DirectMessage,
      Server,
      JoinServer,
    ]),
  ],
  providers: [SocketGateway, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
