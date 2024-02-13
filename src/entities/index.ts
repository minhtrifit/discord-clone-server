import {
  User,
  Friend,
  FriendPending,
  DirectMessage,
} from "src/user/entities/user.entity";
import { Server, JoinServer } from "src/server/entities/server.entity";
import { Chat } from "src/chat/entities/chat.entity";
import { Category, Channel } from "src/category/entities/category.entity";

const entities = [
  User,
  Server,
  JoinServer,
  Friend,
  FriendPending,
  DirectMessage,
  Chat,
  Category,
  Channel,
];

export {
  User,
  Server,
  JoinServer,
  Friend,
  FriendPending,
  DirectMessage,
  Chat,
  Category,
  Channel,
};
export default entities;
