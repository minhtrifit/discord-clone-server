import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, Friend, FriendPending, DirectMessage } from "../entities/index";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friend, FriendPending, DirectMessage]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
