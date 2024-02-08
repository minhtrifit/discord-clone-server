import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, Chat } from "../entities/index";

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat])],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
