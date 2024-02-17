import { IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator";

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

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean | null;
}

export class EditUserDto {
  @IsString()
  id: string;

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
