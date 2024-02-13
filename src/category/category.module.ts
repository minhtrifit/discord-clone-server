import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryGateway } from "./category.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  User,
  Chat,
  Server,
  JoinServer,
  Category,
  Channel,
} from "../entities/index";
import { SocketModule } from "src/socket/socket.module";
import { MessageModule } from "src/message/message.module";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Chat,
      Server,
      JoinServer,
      Category,
      Channel,
    ]),
    SocketModule,
    MessageModule,
    UserModule,
  ],
  providers: [CategoryGateway, CategoryService],
})
export class CategoryModule {}
