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
import { User } from "src/entities";

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
    @MessageBody()
    data: {
      userId: string;
      friendId: string;
      provider: string;
      text: string;
    },
  ) {
    return this.chatService.sendDirectMessage(
      this.server,
      data.userId,
      data.friendId,
      data.provider,
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

  @SubscribeMessage("get_direct_messages")
  getAllDirectMessagesByUserEmailWithPrevUser(
    @MessageBody() data: { email: string; prevFriend: User },
  ) {
    return this.chatService.getAllDirectMessagesByUserEmailWithPrevUser(
      this.server,
      data.email,
      data.prevFriend,
    );
  }

  @SubscribeMessage("delete_chat_by_id")
  deleteChatById(
    @MessageBody() data: { chatId: string; userId: string; friendId: string },
  ) {
    return this.chatService.deleteChatById(
      this.server,
      data.chatId,
      data.userId,
      data.friendId,
    );
  }
}
