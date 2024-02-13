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
}
