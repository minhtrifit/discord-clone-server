import { Module } from "@nestjs/common";
import { ServerService } from "./server.service";
import { ServerController } from "./server.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  User,
  Server,
  JoinServer,
  Chat,
  Category,
  Channel,
} from "../entities/index";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Server,
      JoinServer,
      Chat,
      Category,
      Channel,
    ]),
  ],
  controllers: [ServerController],
  providers: [ServerService],
})
export class ServerModule {}
