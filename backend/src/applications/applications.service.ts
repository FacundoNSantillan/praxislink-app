import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Application } from "./entities/application.entity";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { ApplicationStatus, OfferStatus } from "../common/enums";
import { UsersService } from "../users/users.service";
import { OffersService } from "../offers/offers.service";
import { computeMatchBreakdown } from "./match-score";

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private applicationsRepo: Repository<Application>,
    private usersService: UsersService,
    private offersService: OffersService,
  ) {}

  async apply(userId: string, dto: CreateApplicationDto) {
    const student = await this.usersService.getStudentProfile(userId);
    const offer = await this.offersService.findById(dto.offerId);

    if (offer.status !== OfferStatus.ACTIVA) {
      throw new BadRequestException("Esta oferta ya no está activa.");
    }

    const already = await this.applicationsRepo.findOne({
      where: { offerId: offer.id, studentId: student.id },
    });
    if (already) throw new BadRequestException("Ya te postulaste a esta oferta.");

    const breakdown = computeMatchBreakdown(student, offer);

    const application = this.applicationsRepo.create({
      offerId: offer.id,
      studentId: student.id,
      message: dto.message || "",
      matchScore: breakdown.total,
      matchedKeywords: Array.from(new Set([...breakdown.matchedCvKeywords, ...breakdown.matchedSkills])),
      status: ApplicationStatus.NUEVO,
    });
    return this.applicationsRepo.save(application);
  }

  async listMine(userId: string) {
    const student = await this.usersService.getStudentProfile(userId);
    return this.applicationsRepo.find({
      where: { studentId: student.id },
      relations: ["offer", "offer.company"],
      order: { createdAt: "DESC" },
    });
  }

  hasApplied(studentId: string, offerId: string) {
    return this.applicationsRepo.findOne({ where: { studentId, offerId } });
  }

  async listAppliedOfferIds(userId: string): Promise<string[]> {
    const student = await this.usersService.getStudentProfile(userId);
    const apps = await this.applicationsRepo.find({ where: { studentId: student.id } });
    return apps.map((a) => a.offerId);
  }

  async listForOffer(userId: string, offerId: string) {
    const company = await this.usersService.getCompanyProfile(userId);
    const offer = await this.offersService.findById(offerId);
    if (offer.companyId !== company.id) {
      throw new ForbiddenException("Esta oferta no te pertenece.");
    }
    return this.applicationsRepo.find({
      where: { offerId },
      relations: ["student"],
      order: { matchScore: "DESC" },
    });
  }

  async listForCompany(userId: string) {
    const company = await this.usersService.getCompanyProfile(userId);
    const offers = await this.offersService.listMine(company.id);
    const offerIds = offers.map((o) => o.id);
    if (offerIds.length === 0) return [];
    return this.applicationsRepo
      .createQueryBuilder("application")
      .leftJoinAndSelect("application.student", "student")
      .leftJoinAndSelect("application.offer", "offer")
      .where("application.offerId IN (:...offerIds)", { offerIds })
      .orderBy("application.createdAt", "DESC")
      .getMany();
  }

  async updateStatus(userId: string, applicationId: string, status: ApplicationStatus) {
    const company = await this.usersService.getCompanyProfile(userId);
    const application = await this.applicationsRepo.findOne({
      where: { id: applicationId },
      relations: ["offer"],
    });
    if (!application) throw new BadRequestException("La postulación no existe.");
    if (application.offer.companyId !== company.id) {
      throw new ForbiddenException("Esta postulación no corresponde a tu empresa.");
    }
    application.status = status;
    return this.applicationsRepo.save(application);
  }

  async listForUniversityStudents(universityName: string) {
    return this.applicationsRepo
      .createQueryBuilder("application")
      .leftJoinAndSelect("application.student", "student")
      .leftJoinAndSelect("application.offer", "offer")
      .leftJoinAndSelect("offer.company", "company")
      .where("student.university = :universityName", { universityName })
      .orderBy("application.createdAt", "DESC")
      .getMany();
  }
}
