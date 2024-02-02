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
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

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
  updateUserById(@Body() editUser: CreateUserDto) {
    // {
    //   "id": "8f483a7c-c6fc-40ee-86ce-0bac3d348955",
    //   "name": "Minh Trí"
    // }

    return this.userService.updateUserById(editUser);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
