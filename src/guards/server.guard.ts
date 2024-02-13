import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class ServerJoinGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request?.headers?.userid;

    // console.log("HEADER USER ID", userId);

    if (userId !== undefined) return true;
    return false;
  }
}
