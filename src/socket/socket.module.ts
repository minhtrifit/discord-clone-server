import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { SocketGateway } from "./socket.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, Friend, FriendPending, DirectMessage } from "src/entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend, FriendPending, DirectMessage]),
  ],
  providers: [SocketGateway, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
