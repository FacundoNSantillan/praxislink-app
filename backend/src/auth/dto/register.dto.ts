import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../../common/enums";

export class RegisterDto {
  @IsEmail({}, { message: "Ingresá un email válido." })
  email: string;

  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres." })
  password: string;

  @IsEnum(UserRole, { message: "El tipo de cuenta debe ser empresa, estudiante o universidad." })
  role: UserRole;

  @IsString()
  name: string;

  // Empresa
  @IsOptional() @IsString() rubro?: string;
  @IsOptional() @IsString() site?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @IsString() description?: string;

  // Estudiante
  @IsOptional() @IsString() university?: string;
  @IsOptional() @IsString() career?: string;

  // Universidad
  @IsOptional() @IsString() location?: string;
}
