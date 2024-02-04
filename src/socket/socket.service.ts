import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@Injectable()
export class SocketService {
  users: { email: string; clientId: string }[] = [];

  getUserDisconnect(server: Server, clientId: string) {
    const findUser = this.users.filter((user) => {
      return user.clientId === clientId;
    });

    this.users = this.users.filter((user) => {
      return user.clientId !== clientId;
    });

    // Send event to client
    server.emit("user_disconnect", findUser[0]);

    console.log("Client disconnected:", clientId);
    // console.log("Users from disconnected", this.users);
  }

  startListeners(server: Server, client: Socket, email: string) {
    // console.log("Message received from " + client.id, email);

    const checkClientId = this.users.filter((user) => {
      return user.clientId === client.id;
    })[0];

    if (!checkClientId) {
      this.users.push({
        clientId: client.id,
        email: email,
      });
    }

    // Send event to client
    server
      .to(client.id)
      .emit("user_connected", { clientId: client.id, email: email });

    console.log("Users from connected", this.users);

    return true;
  }

  getAllUsers(server: Server) {
    server.emit("all_users", this.users);
    return true;
  }
}
