import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User, Server as DiscordServer, Chat } from "src/entities";
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
}
