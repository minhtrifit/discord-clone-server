import { User, Friend, FriendPending } from "src/user/entities/user.entity";
import { Server, JoinServer } from "src/server/entities/server.entity";

const entities = [User, Server, JoinServer, Friend, FriendPending];

export { User, Server, JoinServer, Friend, FriendPending };
export default entities;
