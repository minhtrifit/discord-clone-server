import {
  User,
  Friend,
  FriendPending,
  DirectMessage,
} from "src/user/entities/user.entity";
import { Server, JoinServer } from "src/server/entities/server.entity";
import { Chat } from "src/chat/entities/chat.entity";

const entities = [
  User,
  Server,
  JoinServer,
  Friend,
  FriendPending,
  DirectMessage,
  Chat,
];

export { User, Server, JoinServer, Friend, FriendPending, DirectMessage, Chat };
export default entities;
