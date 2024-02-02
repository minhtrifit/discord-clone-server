import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/index";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createNewUser(newUser: CreateUserDto) {
    try {
      const saltRounds = 10;

      const findUser = await this.userRepository.findOne({
        where: { email: newUser.email },
      });

      if (findUser === null) {
        const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);

        newUser.password = hashedPassword;

        await this.userRepository.save(newUser);

        return { message: "Create user successfully", user: newUser };
      }

      return { message: "User already exist", user: newUser };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }

  async getUserByEmail(email: string) {
    try {
      const findUser = await this.userRepository.findOne({
        where: { email: email },
      });

      if (findUser !== null)
        return { message: "Find user sucessfully", user: findUser };

      return { message: "User not found", user: null };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }

  async loginByEmail(user: { email: string; password: string }) {
    try {
      const findUser = await this.userRepository.findOne({
        where: { email: user.email },
      });

      if (findUser === null) return { message: "User not found", user: null };

      if (findUser.provider !== "email") {
        throw new BadRequestException("Wrong credentials");
      }

      const compare = await bcrypt.compare(user.password, findUser.password);

      if (!compare)
        return { message: "Username or password incorrect", user: null };

      return { message: "Login successfully", user: findUser };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
