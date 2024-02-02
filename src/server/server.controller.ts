import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ServerService } from "./server.service";
import { CreateServerDto } from "./dto/create-server.dto";
import { UpdateServerDto } from "./dto/update-server.dto";

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

  @Get()
  findAll() {
    return this.serverService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.serverService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateServerDto: UpdateServerDto) {
    return this.serverService.update(+id, updateServerDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.serverService.remove(+id);
  }
}
