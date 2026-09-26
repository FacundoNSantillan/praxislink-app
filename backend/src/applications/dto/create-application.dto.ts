import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateApplicationDto {
  @IsUUID()
  offerId: string;

  @IsOptional()
  @IsString()
  message?: string;
}
