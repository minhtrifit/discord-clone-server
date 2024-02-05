import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Put,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, EditUserDto } from "./dto/create-user.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UsePipes(ValidationPipe)
  @Post("/create")
  createNewUser(@Body() newUser: CreateUserDto) {
    return this.userService.createNewUser(newUser);
  }

  @Get("/email/:param")
  getUserByEmail(@Param("param") email: string) {
    return this.userService.getUserByEmail(email);
  }

  @Post("/login")
  loginByEmail(@Body() user: { email: string; password: string }) {
    return this.userService.loginByEmail(user);
  }

  @Put("/update/:id")
  updateUserById(@Body() editUser: EditUserDto) {
    // {
    //   "id": "8f483a7c-c6fc-40ee-86ce-0bac3d348955",
    //   "name": "Minh Trí"
    // }

    return this.userService.updateUserById(editUser);
  }

  @Get("/pending/:email")
  getPendingByEmail(@Param("email") email: string) {
    return this.userService.getPendingByEmail(email);
  }

  @Get("/friends/:email")
  getAllFriendsByUserEmail(@Param("email") email: string) {
    return this.userService.getAllFriendsByUserEmail(email);
  }
}
