import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Server, Socket } from "socket.io";
import { User, FriendPending } from "src/entities";
import { Repository } from "typeorm";

@Injectable()
export class SocketService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FriendPending)
    private readonly friendPendingRepository: Repository<FriendPending>,
  ) {}

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

    // console.log("Users from connected", this.users);

    return {
      message: "Connect to sever socket successfully",
      clientId: client.id,
      email: email,
    };
  }

  getAllUsers(server: Server) {
    server.emit("all_users", this.users);
    return true;
  }

  async sendFriendRequest(
    server: Server,
    senderEmail: string,
    receiverEmail: string,
  ) {
    try {
      const getOnlineReceiver = this.users.filter((user) => {
        return user.email === receiverEmail;
      });

      if (getOnlineReceiver.length !== 0) {
        const findSender = await this.userRepository.findOne({
          where: { email: senderEmail },
        });

        for (let i = 0; i < getOnlineReceiver.length; ++i) {
          server.to(getOnlineReceiver[i].clientId).emit("get_friend_request", {
            message: "You have a new friend request",
            user: findSender,
          });
        }
      }

      // Save pending request to database
      const newPending = {
        senderEmail: senderEmail,
        receiverEmail: receiverEmail,
      };

      const findSender = await this.friendPendingRepository.findOne({
        where: { senderEmail: senderEmail, receiverEmail: receiverEmail },
      });

      if (findSender === null)
        await this.friendPendingRepository.save(newPending);

      return {
        message: "Send friend request, successfully",
        senderEmail: senderEmail,
        receiverEmail: receiverEmail,
        status: true,
      };
    } catch (error) {
      return {
        message: "Send friend request, failed",
        senderEmail: senderEmail,
        receiverEmail: receiverEmail,
        status: false,
      };
    }
  }
}
