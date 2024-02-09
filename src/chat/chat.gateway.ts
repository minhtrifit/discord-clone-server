import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage("send_direct_message")
  sendFriendRequest(
    @MessageBody() data: { userId: string; friendId: string; text: string },
  ) {
    return this.chatService.sendDirectMessage(
      this.server,
      data.userId,
      data.friendId,
      data.text,
    );
  }

  @SubscribeMessage("get_all_chats")
  getAllChatsById(@MessageBody() data: { userId: string; friendId: string }) {
    return this.chatService.getAllChatsById(
      this.server,
      data.userId,
      data.friendId,
    );
  }
}
