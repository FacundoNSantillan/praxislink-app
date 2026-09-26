import { IsEnum, IsInt, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { OfferModality, OfferType } from "../../common/enums";

export class CreateOfferDto {
  @IsString() title: string;
  @IsString() area: string;
  @IsEnum(OfferType) type: OfferType;
  @IsEnum(OfferModality) modality: OfferModality;
  @IsString() location: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  vacancies: number;

  @IsString() description: string;
  @IsString() requirements: string;
}
