import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, Chat, DirectMessage } from "../entities/index";
import { SocketModule } from "src/socket/socket.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Chat, DirectMessage]),
    SocketModule,
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
