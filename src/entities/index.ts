import { User, FriendPending } from "src/user/entities/user.entity";
import { Server, JoinServer } from "src/server/entities/server.entity";

const entities = [User, Server, JoinServer, FriendPending];

export { User, Server, JoinServer, FriendPending };
export default entities;
