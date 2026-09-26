import { IsEmail, IsString } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Ingresá un email válido." })
  email: string;

  @IsString()
  password: string;
}
