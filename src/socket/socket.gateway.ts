import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { SocketService } from "./socket.service";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class SocketGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly socketService: SocketService) {}

  handleDisconnect(@ConnectedSocket() client: Socket) {
    return this.socketService.getUserDisconnect(this.server, client.id);
  }

  @SubscribeMessage("get_connect")
  startListeners(
    @ConnectedSocket() client: Socket,
    @MessageBody() userConnectDto,
  ) {
    return this.socketService.startListeners(
      this.server,
      client,
      userConnectDto.email,
    );
  }

  @SubscribeMessage("get_all_users")
  getAllUsers() {
    return this.socketService.getAllUsers(this.server);
  }

  @SubscribeMessage("send_friend_request")
  sendFriendRequest(
    @MessageBody() data: { senderEmail: string; receiverEmail: string },
  ) {
    return this.socketService.sendFriendRequest(
      this.server,
      data.senderEmail,
      data.receiverEmail,
    );
  }
}
