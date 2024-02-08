import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Server } from "socket.io";
import { User, Chat, DirectMessage } from "src/entities";
import { SocketService } from "src/socket/socket.service";

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
  ) {}

  async sendDirectMessage(
    server: Server,
    userId: string,
    friendId: string,
    text: string,
  ) {
    try {
      const newDirectMessage = {
        userId: userId,
        type: "direct", // or server
        provider: "text",
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
}
