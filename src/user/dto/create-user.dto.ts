import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  provider: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  password: string | null;

  @IsString()
  @IsOptional()
  avatar: string | null;
}
