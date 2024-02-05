import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Server, Socket } from "socket.io";
import { User, Friend, FriendPending } from "src/entities";
import { Repository } from "typeorm";

@Injectable()
export class SocketService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
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
      // Check exist user
      const findUser = await this.userRepository.findOne({
        where: { email: receiverEmail },
      });

      if (findUser === null) {
        return {
          message: "Send friend request, failed",
          senderEmail: senderEmail,
          receiverEmail: receiverEmail,
          status: false,
        };
      }

      // Check is friend already
      const isFriend = await this.friendRepository.find({
        where: { senderEmail: senderEmail, receiverEmail: receiverEmail },
      });

      if (isFriend !== null) {
        return {
          message: "Send friend request, failed",
          senderEmail: senderEmail,
          receiverEmail: receiverEmail,
          status: false,
        };
      }

      // Check user is online (is exist)
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

  async ignoreFriendRequest(
    server: Server,
    senderEmail: string,
    receiverEmail: string,
  ) {
    try {
      const findPending = await this.friendPendingRepository.findOne({
        where: { senderEmail: senderEmail, receiverEmail: receiverEmail },
      });

      if (findPending !== null) {
        await this.friendPendingRepository
          .createQueryBuilder()
          .delete()
          .from(FriendPending)
          .where("id = :id", { id: (await findPending).id })
          .execute();

        return {
          message: "Ignore friend request, successfully",
          senderEmail: senderEmail,
          receiverEmail: receiverEmail,
          status: true,
        };
      }

      return {
        message: "Ignore friend request, failed",
        senderEmail: senderEmail,
        receiverEmail: receiverEmail,
        status: false,
      };
    } catch (error) {
      return {
        message: "Ignore friend request, failed",
        senderEmail: senderEmail,
        receiverEmail: receiverEmail,
        status: false,
      };
    }
  }

  async acceptFriendRequest(
    server: Server,
    senderEmail: string,
    receiverEmail: string,
  ) {
    try {
      // Send event to online user
      const getOnlineReceiver = this.users.filter((user) => {
        return user.email === receiverEmail;
      });

      const getOnlineSender = this.users.filter((user) => {
        return user.email === senderEmail;
      });

      if (getOnlineReceiver.length !== 0) {
        const findSender = await this.userRepository.findOne({
          where: { email: senderEmail },
        });

        for (let i = 0; i < getOnlineReceiver.length; ++i) {
          server.to(getOnlineReceiver[i].clientId).emit("new_friend", {
            message: "You have a new friend",
            user: findSender,
          });
        }
      }

      if (getOnlineSender.length !== 0) {
        const findReceiver = await this.userRepository.findOne({
          where: { email: receiverEmail },
        });

        for (let i = 0; i < getOnlineSender.length; ++i) {
          server.to(getOnlineSender[i].clientId).emit("new_friend", {
            message: "You have a new friend",
            user: findReceiver,
          });
        }
      }

      // Save friend to database
      const data = {
        senderEmail: senderEmail,
        receiverEmail: receiverEmail,
      };

      await this.friendRepository.save(data);

      // Remove pending friend
      const findPending = await this.friendPendingRepository.findOne({
        where: { senderEmail: senderEmail, receiverEmail: receiverEmail },
      });

      if (findPending !== null) {
        await this.friendPendingRepository
          .createQueryBuilder()
          .delete()
          .from(FriendPending)
          .where("id = :id", { id: (await findPending).id })
          .execute();
      }

      return {
        message: "Accept friend request, successfully",
        senderEmail: senderEmail,
        receiverEmail: receiverEmail,
        status: true,
      };
    } catch (error) {
      return {
        message: "Accept friend request, failed",
        senderEmail: senderEmail,
        receiverEmail: receiverEmail,
        status: false,
      };
    }
  }
}
