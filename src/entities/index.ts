import {
  User,
  Friend,
  FriendPending,
  DirectMessage,
} from "src/user/entities/user.entity";
import { Server, JoinServer } from "src/server/entities/server.entity";

const entities = [
  User,
  Server,
  JoinServer,
  Friend,
  FriendPending,
  DirectMessage,
];

export { User, Server, JoinServer, Friend, FriendPending, DirectMessage };
export default entities;
