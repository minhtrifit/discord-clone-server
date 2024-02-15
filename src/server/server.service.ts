import { Injectable } from "@nestjs/common";
import { CreateServerDto } from "./dto/create-server.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  JoinServer,
  Server,
  User,
  Chat,
  Category,
  Channel,
} from "../entities/index";

@Injectable()
export class ServerService {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
    @InjectRepository(JoinServer)
    private readonly joinServerRepository: Repository<JoinServer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}

  async createNewServer(newServer: CreateServerDto) {
    try {
      const res = await this.serverRepository.save(newServer);

      const newJoin = {
        serverId: res.id,
        userId: res.owner,
      };

      await this.joinServerRepository.save(newJoin);

      return { message: "Create server successfully", server: res };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }

  async getJoinServerByUserId(id: string) {
    try {
      const servers = [];

      const findUser = await this.userRepository.findOne({
        where: { id: id },
      });

      if (findUser === null) return { message: "User not found", joins: [] };

      const joins = await this.joinServerRepository.find({
        where: { userId: id },
      });

      for (let i = 0; i < joins.length; ++i) {
        const findServer = await this.serverRepository.findOne({
          where: { id: joins[i].serverId },
        });

        if (findServer !== null) servers.push(findServer);
      }

      return { message: "Get user join server successfully", joins: servers };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }

  async getDetailServerById(id: string) {
    try {
      const findServer = await this.serverRepository.findOne({
        where: { id: id },
      });

      if (findServer === null) {
        return {
          message: "Not found server",
          server: null,
        };
      }

      const findServerOwner = await this.userRepository.findOne({
        where: { id: findServer.owner },
      });

      if (findServerOwner === null) {
        return {
          message: "Not found server owner",
          server: null,
        };
      }

      return {
        message: "Get detail server successfully",
        server: { ...findServer, owner: findServerOwner },
      };
    } catch (error) {
      return {
        message: "Get detail server failed",
        server: null,
      };
    }
  }

  async getAllChatsByChannelId(channelId: string) {
    try {
      // Check exist channel
      const findChannel = await this.channelRepository.findOne({
        where: { id: channelId },
      });

      if (findChannel === null) {
        return {
          message: "Get all chats by channel id failed",
          channel: null,
          chats: [],
        };
      }

      const findChats = await this.chatRepository.find({
        where: { channelId: channelId },
      });

      const chats = [];

      for (let i = 0; i < findChats.length; ++i) {
        const findUser = await this.userRepository.findOne({
          where: { id: findChats[i].userId },
        });

        if (findUser !== null) {
          const chat = {
            ...findChats[i],
            user: findUser,
          };
          chats.push(chat);
        }
      }

      return {
        message: "Get all chats by channel id successfully",
        channel: findChannel,
        chats: chats,
      };
    } catch (error) {
      return {
        message: "Get all chats by channel id failed",
        channel: null,
        chats: [],
      };
    }
  }

  async getChannelById(channelId: string) {
    try {
      // Check exist channel
      const findChannel = await this.channelRepository.findOne({
        where: { id: channelId },
      });

      if (findChannel === null) {
        return {
          message: "Get channel by id failed",
          channel: null,
        };
      }

      return {
        message: "Get channel by id successfully",
        channel: findChannel,
      };
    } catch (error) {
      return {
        message: "Get channel by id failed",
        channel: null,
      };
    }
  }

  async getServerInviteLink(serverId: string) {
    try {
      // Check exist server
      const findServer = await this.serverRepository.findOne({
        where: { id: serverId },
      });

      if (findServer === null) {
        return {
          message: "Get server invite link failed",
          inviteLink: null,
        };
      }

      // Create invite link
      const inviteLink = `${process.env.CLIENT_URL}/discord.gg/${findServer?.id}`;

      return {
        message: "Get server invite link successfully",
        inviteLink: inviteLink,
      };
    } catch (error) {
      return {
        message: "Get server invite link failed",
        inviteLink: null,
      };
    }
  }

  async joinServerByInviteLink(userId: string, inviteLink: string) {
    try {
      const serverId = inviteLink.split("/discord.gg/")[1];

      if (serverId) {
        const findServer = await this.serverRepository.findOne({
          where: { id: serverId },
        });

        const findUser = await this.userRepository.findOne({
          where: { id: userId },
        });

        if (findServer === null || findUser === null) {
          return {
            message: "Join server by invite link failed",
            clientUrl: process.env.CLIENT_URL,
            server: null,
          };
        }

        const newJoin = {
          serverId: serverId,
          userId: userId,
        };

        const findServerJoin = await this.joinServerRepository.findOne({
          where: { serverId: serverId, userId: userId },
        });

        if (findServerJoin === null)
          await this.joinServerRepository.save(newJoin);

        return {
          message: "Join server by invite link successfully",
          clientUrl: process.env.CLIENT_URL,
          server: findServer,
        };
      }

      return {
        message: "Join server by invite link failed",
        clientUrl: process.env.CLIENT_URL,
        server: null,
      };
    } catch (error) {
      return {
        message: "Join server by invite link failed",
        clientUrl: process.env.CLIENT_URL,
        server: null,
      };
    }
  }
}
