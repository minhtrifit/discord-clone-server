import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getConnectServer(): { message: string } {
    return { message: "Server run successfully" };
  }
}
