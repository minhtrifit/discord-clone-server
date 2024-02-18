import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  User,
  Server,
  Channel,
  Category,
  JoinServer,
  Chat,
} from "src/entities";
import { SocketModule } from "src/socket/socket.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Server,
      Channel,
      Category,
      JoinServer,
      Chat,
    ]),
    SocketModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
