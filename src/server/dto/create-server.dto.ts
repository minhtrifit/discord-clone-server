import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateServerDto {
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsString()
  @IsOptional()
  avatar: string | null;
}
