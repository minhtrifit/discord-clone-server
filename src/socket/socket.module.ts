import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { SocketGateway } from "./socket.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, Friend, FriendPending } from "src/entities";

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend, FriendPending])],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
