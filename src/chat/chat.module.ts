import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, Chat, DirectMessage } from "../entities/index";
import { SocketModule } from "src/socket/socket.module";
import { MessageModule } from "src/message/message.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Chat, DirectMessage]),
    SocketModule,
    MessageModule,
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
