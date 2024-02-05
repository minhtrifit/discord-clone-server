import { Injectable } from "@nestjs/common";
import { CreateServerDto } from "./dto/create-server.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JoinServer, Server, User } from "../entities/index";

@Injectable()
export class ServerService {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
    @InjectRepository(JoinServer)
    private readonly joinServerRepository: Repository<JoinServer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
