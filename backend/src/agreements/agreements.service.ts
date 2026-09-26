import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Agreement } from "./entities/agreement.entity";
import { CreateAgreementDto } from "./dto/create-agreement.dto";
import { AgreementStatus } from "../common/enums";
import { UsersService } from "../users/users.service";

@Injectable()
export class AgreementsService {
  constructor(
    @InjectRepository(Agreement) private agreementsRepo: Repository<Agreement>,
    private usersService: UsersService,
  ) {}

  async listMine(userId: string) {
    const university = await this.usersService.getUniversityProfile(userId);
    return this.agreementsRepo.find({
      where: { universityId: university.id },
      order: { signedAt: "DESC" },
    });
  }

  async create(userId: string, dto: CreateAgreementDto) {
    const university = await this.usersService.getUniversityProfile(userId);
    const company = await this.usersService.findCompanyById(dto.companyId);
    if (!company) throw new BadRequestException("La empresa seleccionada no existe.");

    const agreement = this.agreementsRepo.create({
      universityId: university.id,
      companyId: company.id,
      type: dto.type,
      status: AgreementStatus.PENDIENTE_FIRMA,
    });
    return this.agreementsRepo.save(agreement);
  }

  async markSigned(userId: string, agreementId: string) {
    const university = await this.usersService.getUniversityProfile(userId);
    const agreement = await this.agreementsRepo.findOne({ where: { id: agreementId } });
    if (!agreement) throw new BadRequestException("El convenio no existe.");
    if (agreement.universityId !== university.id) {
      throw new ForbiddenException("Este convenio no corresponde a tu universidad.");
    }
    agreement.status = AgreementStatus.VIGENTE;
    return this.agreementsRepo.save(agreement);
  }
}
