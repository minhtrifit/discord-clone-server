import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Server, Socket } from "socket.io";
import {
  User,
  Server as DiscordServer,
  JoinServer,
  Category,
  Channel,
  Chat,
} from "src/entities";
import { Repository } from "typeorm";
import { SocketService } from "src/socket/socket.service";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DiscordServer)
    private readonly serverRepository: Repository<DiscordServer>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    private readonly socketService: SocketService,
    @InjectRepository(JoinServer)
    private readonly joinServerRepository: Repository<JoinServer>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async getServerMemberClientByServerId(serverId: string) {
    // Get all server's member
    const findMembers = await this.joinServerRepository.find({
      where: { serverId: serverId },
    });

    // Send event to server's member client
    const memberClients = [];

    for (let i = 0; i < findMembers.length; ++i) {
      for (let j = 0; j < this.socketService.users.length; ++j) {
        // Get member info from database
        const member = await this.userRepository.findOne({
          where: { id: findMembers[i].userId },
        });

        if (
          member !== null &&
          this.socketService.users[j].email === member.email
        ) {
          memberClients.push(this.socketService.users[j]);
        }
      }
    }

    // console.log("MEMBER CLIENT", memberClients);

    return memberClients;
  }

  sortBySended(chats: Chat[]): Chat[] {
    return chats.sort((a, b) => a.sended.getTime() - b.sended.getTime());
  }

  async createNewCategory(
    server: Server,
    serverId: string,
    name: string,
    isPrivate: boolean,
  ) {
    try {
      // Check exist server
      const findServer = await this.serverRepository.findOne({
        where: { id: serverId },
      });

      if (findServer === null) {
        return {
          message: "Create new category failed",
          category: null,
        };
      }

      // Create new server
      const newCategory = {
        serverId: serverId,
        name: name,
        isPrivate: isPrivate,
      };

      const res = await this.categoryRepository.save(newCategory);

      // Get all category's channels
      const findChannels = await this.channelRepository.find({
        where: { categoryId: res?.id },
      });

      // Send event to server's member client
      const memberClients =
        await this.getServerMemberClientByServerId(serverId);

      const category = { ...res, channels: findChannels };

      for (let i = 0; i < memberClients.length; ++i) {
        server.to(memberClients[i].clientId).emit("get_new_category", {
          message: "Your server have a new category",
          category: category,
        });
      }

      return {
        message: "Create new category successfully",
        category: category,
      };
    } catch (error) {
      return {
        message: "Create new category failed",
        category: null,
      };
    }
  }

  async getAllCategoriesByServerId(server: Server, serverId: string) {
    try {
      // Check Exist server
      const findServer = this.serverRepository.findOne({
        where: { id: serverId },
      });

      if (findServer === null) {
        return {
          message: "Get all categories by server id failed",
          categories: null,
        };
      }

      // Get all categories
      const categories = [];

      const findCategories = await this.categoryRepository.find({
        where: { serverId: serverId },
      });

      for (let i = 0; i < findCategories.length; ++i) {
        // Get all channels by category id
        const findChannels = await this.channelRepository.find({
          where: { categoryId: findCategories[i].id },
        });

        // New category with channels key
        const categoryWithChannels = {
          ...findCategories[i],
          channels: findChannels,
        };

        categories.push(categoryWithChannels);
      }

      // console.log(categories);

      return {
        message: "Get all categories by server id successfully",
        categories: categories,
      };
    } catch (error) {
      return {
        message: "Get all categories by server id failed",
        categories: null,
      };
    }
  }

  async createNewChannel(
    server: Server,
    serverId: string,
    categoryId: string,
    name: string,
    type: string,
  ) {
    try {
      // Check exist category
      const findCategory = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (findCategory === null) {
        return {
          message: "Create new channel failed",
          channel: null,
        };
      }

      // Create new channel
      const newChannel = {
        categoryId: categoryId,
        name: name,
        type: type,
      };

      const res = await this.channelRepository.save(newChannel);

      // Send event to server's member client
      const memberClients =
        await this.getServerMemberClientByServerId(serverId);

      for (let i = 0; i < memberClients.length; ++i) {
        server.to(memberClients[i].clientId).emit("get_new_channel", {
          message: "Your server have a new channel",
          channel: res,
        });
      }

      return {
        message: "Create new channel successfully",
        channel: res,
      };
    } catch (error) {
      return {
        message: "Create new channel failed",
        channel: null,
      };
    }
  }

  async deleteChannelById(
    server: Server,
    userId: string,
    serverId: string,
    categoryId: string,
    channelId: string,
  ) {
    try {
      let checkPermission = false;

      // Check exist channel
      const findChannel = await this.channelRepository.findOne({
        where: { id: channelId },
      });

      if (findChannel === null) {
        return {
          message: "Delete channel by id failed",
          status: false,
        };
      }

      // Check owner permission
      const findCategory = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (findCategory === null) {
        return {
          message: "Delete channel by id failed",
          status: false,
        };
      }

      const findServer = await this.serverRepository.findOne({
        where: { id: serverId },
      });

      if (findServer === null) {
        return {
          message: "Delete channel by id failed",
          status: false,
        };
      }

      const findOwner = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (findOwner === null) {
        return {
          message: "Delete channel by id failed",
          status: false,
        };
      }

      // More permission...

      // Set if all permissions is correct
      checkPermission = true;

      if (checkPermission) {
        await this.channelRepository
          .createQueryBuilder()
          .delete()
          .from(Channel)
          .where("id = :id", { id: channelId })
          .execute();

        // Send event to server's member client
        const memberClients =
          await this.getServerMemberClientByServerId(serverId);

        for (let i = 0; i < memberClients.length; ++i) {
          server.to(memberClients[i].clientId).emit("get_delete_channel", {
            message: "Your server delete a channel",
            channelId: channelId,
          });
        }

        return {
          message: "Delete channel by id successfully",
          status: true,
        };
      }

      return {
        message: "Delete channel by id failed",
        status: false,
      };
    } catch (error) {
      return {
        message: "Delete channel by id failed",
        status: false,
      };
    }
  }

  async deleteCategoryById(
    server: Server,
    userId: string,
    serverId: string,
    categoryId: string,
  ) {
    try {
      let checkPermission = false;

      // Check exist category
      const findCategory = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });

      if (findCategory === null) {
        return {
          message: "Delete channel by id failed",
          status: false,
        };
      }

      // Check owner permission
      const findServer = await this.serverRepository.findOne({
        where: { id: serverId },
      });

      if (findServer === null) {
        return {
          message: "Delete channel by id failed",
          status: false,
        };
      }

      const findOwner = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (findOwner === null) {
        return {
          message: "Delete category by id failed",
          status: false,
        };
      }

      // More permission...

      // Set if all permissions is correct
      checkPermission = true;

      if (checkPermission) {
        // Delete all category channels
        await this.channelRepository
          .createQueryBuilder()
          .delete()
          .from(Channel)
          .where("categoryId = :categoryId", { categoryId: categoryId })
          .execute();

        await this.channelRepository
          .createQueryBuilder()
          .delete()
          .from(Category)
          .where("id = :id", { id: categoryId })
          .execute();

        // Send event to server's member client
        const memberClients =
          await this.getServerMemberClientByServerId(serverId);

        for (let i = 0; i < memberClients.length; ++i) {
          server.to(memberClients[i].clientId).emit("get_delete_category", {
            message: "Your server delete a category",
            categoryId: categoryId,
          });
        }

        return {
          message: "Delete category by id successfully",
          status: true,
        };
      }

      return {
        message: "Delete category by id failed",
        status: false,
      };
    } catch (error) {
      return {
        message: "Delete category by id failed",
        status: false,
      };
    }
  }

  async sendChannelMessage(
    server: Server,
    userId: string,
    serverId: string,
    channelId: string,
    provider: string,
    text: string,
    fileName: string,
    url: string,
  ) {
    try {
      let newChannelMessage = null;

      if (provider === "text") {
        newChannelMessage = {
          userId: userId,
          type: "channel",
          provider: provider,
          serverId: serverId,
          channelId: channelId,
          text: text,
        };
      } else if (provider === "image") {
        newChannelMessage = {
          userId: userId,
          type: "channel",
          provider: provider,
          serverId: serverId,
          channelId: channelId,
          url: url,
        };
      } else if (provider === "file") {
        newChannelMessage = {
          userId: userId,
          type: "channel",
          provider: provider,
          serverId: serverId,
          channelId: channelId,
          fileName: fileName,
          url: url,
        };
      }

      const res = await this.chatRepository.save(newChannelMessage);

      const findUser = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (findUser === null) {
        return {
          message: "Send channel message failed",
          user: null,
          chat: null,
        };
      }

      // Find online receiver id
      const findMemberClient =
        await this.getServerMemberClientByServerId(serverId);

      // Send event to client
      if (findMemberClient?.length !== 0) {
        for (let i = 0; i < findMemberClient.length; ++i) {
          console.log("MEMBER CLIENT", findMemberClient[i].email);
          server
            .to(findMemberClient[i].clientId)
            .emit("receive_channel_message", {
              message: "You have new channel message",
              user: findUser,
              chats: res,
            });
        }
      }

      return {
        message: "Send channel message successfully",
        user: findUser,
        chat: res,
      };
    } catch (error) {
      console.log("Save channel message failed");
      return {
        message: "Send channel message failed",
        user: null,
        chat: null,
      };
    }
  }

  async getAllChannelChats(
    server: Server,
    userId: string,
    serverId: string,
    channelId: string,
  ) {
    try {
      // Check exist channel
      const findChannel = await this.channelRepository.findOne({
        where: { id: channelId },
      });

      if (findChannel === null) {
        return {
          message: "Send channel message failed",
          chats: null,
        };
      }

      // Find all channel chat
      const findChannelChats = await this.chatRepository.find({
        where: { channelId: channelId },
      });

      const chats = [];

      for (let i = 0; i < findChannelChats.length; ++i) {
        const findUser = await this.userRepository.findOne({
          where: { id: findChannelChats[i].userId },
        });

        if (findUser !== null) {
          const chat = { ...findChannelChats[i], user: findUser };
          chats.push(chat);
        }
      }

      const chatsBySended = this.sortBySended(chats);

      return {
        message: "Get all channel chats successfully",
        chats: chatsBySended,
      };
    } catch (error) {
      return {
        message: "Get all channel chats failed",
        chats: null,
      };
    }
  }

  async leaveServer(server: Server, userId: string, serverId) {
    try {
      // Check exist server
      const findServer = await this.serverRepository.findOne({
        where: { id: serverId },
      });

      if (findServer === null) {
        return {
          message: "Leave server failed",
        };
      }

      // Check exist user
      const findUser = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (findUser === null) {
        return {
          message: "Leave server failed",
        };
      }

      const res = await this.channelRepository
        .createQueryBuilder()
        .delete()
        .from(JoinServer)
        .where("serverId = :serverId", { serverId: serverId })
        .andWhere("userId = :userId", { userId: userId })
        .execute();

      console.log(res);

      return {
        message: "Leave server successfully",
      };
    } catch (error) {
      return {
        message: "Leave server failed",
      };
    }
  }
}
