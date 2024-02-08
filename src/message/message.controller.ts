import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { MessageService } from "./message.service";

@Controller("message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get("/direct")
  getAllChatsById(@Body() data: { userId: string; friendId: string }) {
    return this.messageService.getAllChatsById(data.userId, data.friendId);
  }
}
