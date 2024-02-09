import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User, Chat } from "../entities/index";
import { Repository } from "typeorm";

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  sortBySended(chats: Chat[]): Chat[] {
    return chats.sort((a, b) => a.sended.getTime() - b.sended.getTime());
  }

  async getAllChatsById(userId: string, friendId: string) {
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

      const chats = this.sortBySended(findChats.concat(findChats2));

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
}
