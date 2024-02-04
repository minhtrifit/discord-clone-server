import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { SocketGateway } from "./socket.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, FriendPending } from "src/entities";

@Module({
  imports: [TypeOrmModule.forFeature([User, FriendPending])],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
