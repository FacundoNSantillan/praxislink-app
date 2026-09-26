import { IsString, IsUUID } from "class-validator";

export class CreateAgreementDto {
  @IsUUID()
  companyId: string;

  @IsString()
  type: string;
}
