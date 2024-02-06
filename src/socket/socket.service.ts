import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Server, Socket } from "socket.io";
import { User, Friend, FriendPending, DirectMessage } from "src/entities";
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
    @InjectRepository(DirectMessage)
    private readonly directMessageRepository: Repository<DirectMessage>,
  ) {}

  users: { email: string; clientId: string }[] = [];

  async getFriendsByUserEmail(userEmail: string) {
    const friends = [];

    // Get friend from database
    const friendListSend = await this.friendRepository.find({
      where: { senderEmail: userEmail },
    });

    const friendListRec = await this.friendRepository.find({
      where: { receiverEmail: userEmail },
    });

    for (let i = 0; i < friendListSend.length; ++i) {
      const getFriend = await this.userRepository.findOne({
        where: { email: friendListSend[i].receiverEmail },
      });

      if (getFriend !== null) friends.push(getFriend);
    }

    for (let i = 0; i < friendListRec.length; ++i) {
      const getFriend = await this.userRepository.findOne({
        where: { email: friendListRec[i].senderEmail },
      });

      if (getFriend !== null) friends.push(getFriend);
    }

    return friends;
  }

  async getUserDisconnect(server: Server, clientId: string) {
    const findUser = this.users.filter((user) => {
      return user.clientId === clientId;
    });

    this.users = this.users.filter((user) => {
      return user.clientId !== clientId;
    });

    // Send event to client
    server.emit("user_disconnect", findUser[0]);

    console.log("Client disconnected:", `${clientId}, ${findUser[0]?.email}}`);
    // console.log("Users from disconnected", this.users);

    // Update online friends
    const friends = await this.getFriendsByUserEmail(findUser[0]?.email);

    // Get all online friends of disconnected user
    const onlines = [];

    for (let i = 0; i < friends.length; ++i) {
      for (let j = 0; j < this.users.length; ++j) {
        if (this.users[j].email === friends[i].email) {
          onlines.push(this.users[j]);
        }
      }
    }

    // Send offline user to all online friend
    const friend = await this.userRepository.findOne({
      where: { email: findUser[0]?.email },
    });

    if (friend !== null) {
      for (let i = 0; i < onlines.length; ++i) {
        server.to(onlines[i].clientId).emit("friend_disconnected", {
          message: "Your friend just offline",
          friend: friend,
        });
      }
    }
  }

  async startListeners(server: Server, client: Socket, email: string) {
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

    // Send online user to all friends
    const friends = await this.getFriendsByUserEmail(email);

    // Get all online friends of connected user
    const onlines = [];

    for (let i = 0; i < friends.length; ++i) {
      for (let j = 0; j < this.users.length; ++j) {
        if (this.users[j].email === friends[i].email) {
          onlines.push(this.users[j]);
        }
      }
    }

    // Send online user to all online friend
    const friend = await this.userRepository.findOne({
      where: { email: email },
    });

    if (friend !== null) {
      for (let i = 0; i < onlines.length; ++i) {
        server.to(onlines[i].clientId).emit("friend_connected", {
          message: "Your friend just online",
          friend: friend,
        });
      }
    }

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

      console.log("FIND USER", findUser);

      if (findUser === null) {
        return {
          message: "Send friend request, failed",
          senderEmail: senderEmail,
          receiverEmail: receiverEmail,
          status: false,
        };
      }

      // Check is friend already
      const isFriendReceiver = await this.friendRepository.findOne({
        where: { senderEmail: senderEmail, receiverEmail: receiverEmail },
      });

      const isFriendSender = await this.friendRepository.findOne({
        where: { senderEmail: receiverEmail, receiverEmail: senderEmail },
      });

      console.log("IS FRIEND RECEIVER", isFriendReceiver);
      console.log("IS FRIEND SENDER", isFriendSender);

      if (isFriendReceiver !== null || isFriendSender !== null) {
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

  async getOnlineFriendsByUserEmail(server: Server, email: string) {
    try {
      const onlines = [];

      const findUser = await this.userRepository.findOne({
        where: { email: email },
      });

      if (findUser === null)
        return {
          message: "Get online friends, failed",
          onlines: [],
        };

      // Get friends from database
      const friends = await this.getFriendsByUserEmail(email);

      // Get online user
      for (let i = 0; i < this.users.length; ++i) {
        for (let j = 0; j < friends.length; ++j) {
          if (this.users[i].email === friends[j].email) {
            onlines.push(friends[j]);
          }
        }
      }

      // Filter dublicate user
      const uniqueOnlines = onlines?.filter((item, index, self) => {
        return self.findIndex((obj) => obj.email === item.email) === index;
      });

      return {
        message: "Get online friends, successfully",
        onlines: uniqueOnlines,
      };
    } catch (error) {
      return {
        message: "Get online friends, failed",
        onlines: [],
      };
    }
  }

  async createDirectMessage(ownerEmail: string, friendEmail: string) {
    try {
      const findDirectMessage = await this.directMessageRepository.findOne({
        where: { ownerEmail: ownerEmail, friendEmail: friendEmail },
      });

      if (findDirectMessage !== null) {
        return {
          message: "Create direct message, failed",
          ownerEmail: ownerEmail,
          friendEmail: friendEmail,
        };
      }

      const newDirectMessage = {
        ownerEmail: ownerEmail,
        friendEmail: friendEmail,
      };

      await this.directMessageRepository.save(newDirectMessage);

      const findFriend = await this.userRepository.findOne({
        where: { email: friendEmail },
      });

      if (findFriend === null) {
        return {
          message: "Create direct message, failed",
          ownerEmail: ownerEmail,
          friendEmail: friendEmail,
        };
      }

      // Send event to client
      return {
        message: "Create direct message, successfully",
        friend: findFriend,
      };
    } catch (error) {
      return {
        message: "Create direct message, failed",
        ownerEmail: ownerEmail,
        friendEmail: friendEmail,
      };
    }
  }

  async deleteDirectMessage(ownerEmail: string, friendEmail: string) {
    try {
      const findDirectMessage = await this.directMessageRepository.findOne({
        where: { ownerEmail: ownerEmail, friendEmail: friendEmail },
      });

      if (findDirectMessage !== null) {
        await this.friendPendingRepository
          .createQueryBuilder()
          .delete()
          .from(DirectMessage)
          .where("ownerEmail = :ownerEmail", { ownerEmail: ownerEmail })
          .andWhere("friendEmail = :friendEmail", { friendEmail: friendEmail })
          .execute();

        return {
          message: "Delete direct message, successfully",
          ownerEmail: ownerEmail,
          friendEmail: friendEmail,
        };
      }

      return {
        message: "Delete direct message, failed",
        ownerEmail: ownerEmail,
        friendEmail: friendEmail,
      };
    } catch (error) {
      return {
        message: "Delete direct message, failed",
        ownerEmail: ownerEmail,
        friendEmail: friendEmail,
      };
    }
  }
}
