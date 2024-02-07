import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto, EditUserDto } from "./dto/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User, Friend, FriendPending, DirectMessage } from "../entities/index";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(FriendPending)
    private readonly friendPendingRepository: Repository<FriendPending>,
    @InjectRepository(DirectMessage)
    private readonly directMessageRepository: Repository<DirectMessage>,
  ) {}

  async createNewUser(newUser: CreateUserDto) {
    try {
      const saltRounds = 10;

      const findUser = await this.userRepository.findOne({
        where: { email: newUser.email },
      });

      if (findUser === null) {
        // Hash password with email provider user
        if (newUser.provider === "email") {
          const hashedPassword = await bcrypt.hash(
            newUser.password,
            saltRounds,
          );

          newUser.password = hashedPassword;
        }

        await this.userRepository.save(newUser);

        return { message: "Create user successfully", user: newUser };
      }

      return { message: "User already exist", user: newUser };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }

  async updateUserById(editUser: EditUserDto) {
    try {
      const saltRounds = 10;
      let hashedPassword = "";

      if (editUser.password !== undefined) {
        hashedPassword = await bcrypt.hash(editUser.password, saltRounds);

        await this.userRepository
          .createQueryBuilder()
          .update(User)
          .set({
            password: hashedPassword,
          })
          .where("id = :id", { id: editUser.id })
          .execute();
      }

      if (editUser.name !== undefined) {
        await this.userRepository
          .createQueryBuilder()
          .update(User)
          .set({
            name: editUser.name,
          })
          .where("id = :id", { id: editUser.id })
          .execute();
      }

      if (editUser.avatar !== undefined) {
        await this.userRepository
          .createQueryBuilder()
          .update(User)
          .set({
            avatar: editUser.avatar,
          })
          .where("id = :id", { id: editUser.id })
          .execute();
      }

      // await this.userRepository
      //   .createQueryBuilder()
      //   .update(User)
      //   .set({
      //     name: editUser.name,
      //     avatar: editUser.avatar,
      //   })
      //   .where("id = :id", { id: editUser.id })
      //   .execute();

      return { message: "Edit user successfully", user: editUser };
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

  async getPendingByEmail(email: string) {
    try {
      const findPending = await this.friendPendingRepository.find({
        where: { receiverEmail: email },
      });

      const pendings = [];

      for (let i = 0; i < findPending.length; ++i) {
        const findUser = await this.userRepository.findOne({
          where: { email: findPending[i].senderEmail },
        });
        pendings.push(findUser);
      }

      return { message: "Get pending successfully", pendings: pendings };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }

  async getAllFriendsByUserEmail(email: string) {
    try {
      const emails = [];
      const friends = [];

      const senders = await this.friendRepository.find({
        where: { senderEmail: email },
      });

      const receivers = await this.friendRepository.find({
        where: { receiverEmail: email },
      });

      for (let i = 0; i < senders.length; ++i) {
        emails.push(senders[i].receiverEmail);
      }

      for (let i = 0; i < receivers.length; ++i) {
        emails.push(receivers[i].senderEmail);
      }

      for (let i = 0; i < emails.length; ++i) {
        const findUser = await this.userRepository.findOne({
          where: { email: emails[i] },
        });

        if (findUser !== null) friends.push(findUser);
      }

      return { message: "Get friends successfully", friends: friends };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }

  async getDirectMessagesByUserEmail(email: string) {
    try {
      const findDirectMessages = await this.directMessageRepository.find({
        where: { ownerEmail: email },
      });

      const friends = [];

      for (let i = 0; i < findDirectMessages.length; ++i) {
        const findUser = await this.userRepository.findOne({
          where: { email: findDirectMessages[i].friendEmail },
        });

        friends.push(findUser);
      }

      return { message: "Get direct messages successfully", friends: friends };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }

  async getUserById(id: string) {
    try {
      const findUser = await this.userRepository.findOne({
        where: { id: id },
      });

      if (findUser !== null)
        return { message: "Find user sucessfully", user: findUser };

      return { message: "User not found", user: null };
    } catch (error) {
      console.log("Something wrong", error);
      return { message: "Something wrong" };
    }
  }
}
