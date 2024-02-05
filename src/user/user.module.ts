import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, Friend, FriendPending } from "../entities/index";

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend, FriendPending])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
