import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ServerService } from "./server.service";
import { CreateServerDto } from "./dto/create-server.dto";
import { ServerJoinGuard } from "src/guards/server.guard";

@Controller("server")
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post("/create")
  create(@Body() newServer: CreateServerDto) {
    return this.serverService.createNewServer(newServer);
  }

  @Get("/join/server/:id")
  getJoinServerByUserId(@Param("id") id: string) {
    return this.serverService.getJoinServerByUserId(id);
  }

  @Get("/detail/:id")
  @UseGuards(ServerJoinGuard)
  getDetailServerById(@Param("id") id: string) {
    return this.serverService.getDetailServerById(id);
  }

  @Get("/channel/chat/:id")
  @UseGuards(ServerJoinGuard)
  getAllChatsByChannelId(@Param("id") id: string) {
    return this.serverService.getAllChatsByChannelId(id);
  }

  @Get("/channel/:id")
  @UseGuards(ServerJoinGuard)
  getChannelById(@Param("id") id: string) {
    return this.serverService.getChannelById(id);
  }

  @Get("/invite/:id")
  @UseGuards(ServerJoinGuard)
  getServerInviteLink(@Param("id") id: string) {
    return this.serverService.getServerInviteLink(id);
  }

  @Post("/invite")
  @UseGuards(ServerJoinGuard)
  joinServerByInviteLink(@Body() body: { userId: string; inviteLink: string }) {
    return this.serverService.joinServerByInviteLink(
      body.userId,
      body.inviteLink,
    );
  }
}
