import { User } from "src/user/entities/user.entity";
import { Server, JoinServer } from "src/server/entities/server.entity";

const entities = [User, Server, JoinServer];

export { User, Server, JoinServer };
export default entities;
