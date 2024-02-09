import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Server } from "socket.io";
import { User, Chat, DirectMessage } from "src/entities";
import { SocketService } from "src/socket/socket.service";
import { MessageService } from "src/message/message.service";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private readonly socketService: SocketService,
    @InjectRepository(DirectMessage)
    private readonly directMessageRepository: Repository<DirectMessage>,
    private readonly messageService: MessageService,
  ) {}

  async sendDirectMessage(
    server: Server,
    userId: string,
    friendId: string,
    provider: string,
    text: string,
  ) {
    try {
      const newDirectMessage = {
        userId: userId,
        type: "direct", // or server
        provider: provider,
        friendId: friendId,
        text: text,
      };

      const res = await this.chatRepository.save(newDirectMessage);

      const findUser = await this.userRepository.findOne({
        where: { id: userId },
      });

      const findFriend = await this.userRepository.findOne({
        where: { id: friendId },
      });

      if (findUser === null || findFriend === null) {
        return {
          message: "Send direct message failed",
          user: null,
          friend: null,
          chat: null,
        };
      }

      // Find online receiver id
      const findFriendClient = this.socketService.users.filter((user) => {
        return user.email === findFriend?.email;
      });

      // Send event to client
      if (findFriendClient?.length !== 0) {
        for (let i = 0; i < findFriendClient.length; ++i) {
          server
            .to(findFriendClient[i].clientId)
            .emit("receive_direct_message", {
              message: "You have new direct message",
              user: findUser,
              chat: res,
            });
        }
      }

      // Save direct message
      const findDirectMessage = await this.directMessageRepository.findOne({
        where: { ownerEmail: findFriend.email, friendEmail: findUser.email },
      });

      if (findDirectMessage === null) {
        const newDirectMessage = {
          ownerEmail: findFriend.email,
          friendEmail: findUser.email,
        };

        await this.directMessageRepository.save(newDirectMessage);
      }

      return {
        message: "Send direct message successfully",
        user: findUser,
        friend: findFriend,
        chat: res,
      };
    } catch (error) {
      console.log("Save direct message failed");
    }
  }

  async getAllChatsById(server: Server, userId: string, friendId: string) {
    try {
      const findUser = this.userRepository.findOne({
        where: { id: userId },
      });

      const findFriend = this.userRepository.findOne({
        where: { id: friendId },
      });

      if (findUser === null || findFriend === null) {
        return {
          message: "Get all direct messages failed",
          user: null,
          friend: null,
          chats: [],
        };
      }

      // Get all chat
      const findChats = await this.chatRepository.find({
        where: { userId: userId, friendId: friendId },
      });

      const findChats2 = await this.chatRepository.find({
        where: { userId: friendId, friendId: userId },
      });

      const chats = this.messageService.sortBySended(
        findChats.concat(findChats2),
      );

      return {
        message: "Get all direct messages successfully",
        user: findUser,
        friend: findFriend,
        chats: chats,
      };
    } catch (error) {
      return {
        message: "Something wrong, get all direct messages failed",
        user: null,
        friend: null,
        chats: [],
      };
    }
  }

  async getAllDirectMessagesByUserEmailWithPrevUser(
    server: Server,
    email: string,
    prevFriend: User,
  ) {
    try {
      const findDirectMessages = await this.directMessageRepository.find({
        where: { ownerEmail: email },
      });

      const friends = [];

      for (let i = 0; i < findDirectMessages.length; ++i) {
        const findUser = await this.userRepository.findOne({
          where: { email: findDirectMessages[i].friendEmail },
        });

        friends.push(findUser);
      }

      const checkPrevFriend = friends.filter((user) => {
        return user.id === prevFriend.id;
      });

      if (checkPrevFriend.length === 0) friends.push(prevFriend);

      return { message: "Get direct messages successfully", friends: friends };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }
}
