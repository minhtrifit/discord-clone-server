import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from "@nestjs/websockets";
import { CategoryService } from "./category.service";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
@WebSocketGateway()
export class CategoryGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly categoryService: CategoryService) {}

  @SubscribeMessage("create_new_category")
  createNewCategory(
    @MessageBody() data: { serverId: string; name: string; isPrivate: boolean },
  ) {
    return this.categoryService.createNewCategory(
      this.server,
      data.serverId,
      data.name,
      data.isPrivate,
    );
  }

  @SubscribeMessage("get_all_categories_by_server_id")
  findAll(@MessageBody() data: { serverId: string }) {
    return this.categoryService.getAllCategoriesByServerId(
      this.server,
      data.serverId,
    );
  }

  @SubscribeMessage("create_new_channel")
  createNewChannel(
    @MessageBody()
    data: {
      serverId: string;
      categoryId: string;
      name: string;
      type: string;
    },
  ) {
    return this.categoryService.createNewChannel(
      this.server,
      data.serverId,
      data.categoryId,
      data.name,
      data.type,
    );
  }

  @SubscribeMessage("delete_channel_by_id")
  deleteChannelById(
    @MessageBody()
    data: {
      userId: string;
      serverId: string;
      categoryId: string;
      channelId: string;
    },
  ) {
    return this.categoryService.deleteChannelById(
      this.server,
      data.userId,
      data.serverId,
      data.categoryId,
      data.channelId,
    );
  }

  @SubscribeMessage("delete_category_by_id")
  deleteCategoryById(
    @MessageBody()
    data: {
      userId: string;
      serverId: string;
      categoryId: string;
    },
  ) {
    return this.categoryService.deleteCategoryById(
      this.server,
      data.userId,
      data.serverId,
      data.categoryId,
    );
  }

  @SubscribeMessage("send_channel_message")
  sendChannelMessage(
    @MessageBody()
    data: {
      userId: string;
      serverId: string;
      channelId: string;
      provider: string;
      text: string;
      fileName: string;
      url: string;
    },
  ) {
    return this.categoryService.sendChannelMessage(
      this.server,
      data.userId,
      data.serverId,
      data.channelId,
      data.provider,
      data.text,
      data.fileName,
      data.url,
    );
  }

  @SubscribeMessage("get_all_channel_chats")
  getAllChannelChats(
    @MessageBody()
    data: {
      userId: string;
      serverId: string;
      channelId: string;
    },
  ) {
    return this.categoryService.getAllChannelChats(
      this.server,
      data.userId,
      data.serverId,
      data.channelId,
    );
  }
}
