import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  User,
  Server as DiscordServer,
  Chat,
  Channel,
  Category,
  JoinServer,
} from "src/entities";
import { Repository } from "typeorm";
import { SocketService } from "src/socket/socket.service";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DiscordServer)
    private readonly serverRepository: Repository<DiscordServer>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(JoinServer)
    private readonly joinServerRepository: Repository<JoinServer>,
    private readonly socketService: SocketService,
  ) {}

  async getAllUsers() {
    try {
      const data = await this.userRepository.find();

      const users = data.filter((user) => {
        if (user.isAdmin === false) return user;
      });

      return {
        message: "Get all users successfully",
        users: users,
        total: users?.length,
      };
    } catch (error) {
      return {
        message: "Get all users failed",
        users: null,
        total: null,
      };
    }
  }

  async getAllServer() {
    try {
      const data = await this.serverRepository.find();

      const servers = [];

      for (let i = 0; i < data.length; ++i) {
        const user = await this.userRepository.findOne({
          where: { id: data[i].owner },
        });

        const newServer = {
          ...data[i],
          owner: user,
        };

        servers.push(newServer);
      }

      return {
        message: "Get all servers successfully",
        servers: servers,
        total: servers?.length,
      };
    } catch (error) {
      return {
        message: "Get all servers failed",
        servers: null,
        total: null,
      };
    }
  }

  async getServersAnalysis() {
    try {
      const servers = await this.serverRepository.find();

      const data = [];

      for (let i = 0; i < servers.length; ++i) {
        const findJoinsServer = await this.joinServerRepository.find({
          where: { serverId: servers[i].id },
        });

        const findCategories = await this.categoryRepository.find({
          where: { serverId: servers[i].id },
        });

        for (let j = 0; j < findCategories.length; ++j) {
          const findChannels = await this.channelRepository.find({
            where: { categoryId: findCategories[j].id },
          });

          const server = {
            ...servers[i],
            members: findJoinsServer,
            totalMembers: findJoinsServer.length,
            categories: findCategories,
            totalCategories: findCategories.length,
            channels: findChannels,
            totalChannels: findChannels.length,
          };

          data.push(server);
        }
      }

      return {
        message: "Get servers analysis successfully",
        servers: data,
      };
    } catch (error) {
      return {
        message: "Get servers analysis failed",
        servers: null,
      };
    }
  }

  async getAllChats() {
    try {
      const chats = await this.chatRepository.find();
      return {
        message: "Get all chats successfully",
        chats: chats,
        total: chats?.length,
      };
    } catch (error) {
      return {
        message: "Get all chats failed",
        chats: null,
        total: null,
      };
    }
  }
}
