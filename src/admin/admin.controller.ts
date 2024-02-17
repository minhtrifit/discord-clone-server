import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { AdminService } from "./admin.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("/users")
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get("/servers")
  getAllServer() {
    return this.adminService.getAllServer();
  }
}
