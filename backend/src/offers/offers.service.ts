import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Offer } from "./entities/offer.entity";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { OfferStatus } from "../common/enums";
import { PlansService } from "../plans/plans.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    private plansService: PlansService,
    private usersService: UsersService,
  ) {}

  async listActive(filters: { area?: string; type?: string; q?: string }) {
    const qb = this.offersRepo
      .createQueryBuilder("offer")
      .leftJoinAndSelect("offer.company", "company")
      .where("offer.status = :status", { status: OfferStatus.ACTIVA })
      .orderBy("offer.createdAt", "DESC");

    if (filters.area) qb.andWhere("offer.area = :area", { area: filters.area });
    if (filters.type) qb.andWhere("offer.type = :type", { type: filters.type });
    if (filters.q) {
      qb.andWhere("(LOWER(offer.title) LIKE :q OR LOWER(company.name) LIKE :q)", {
        q: `%${filters.q.toLowerCase()}%`,
      });
    }
    return qb.getMany();
  }

  async listForUniversity(userId: string, filters: { area?: string; type?: string; q?: string }) {
    const limit = await this.plansService.getVisibleOffersLimit(userId);
    const offers = await this.listActive(filters);
    return limit != null ? offers.slice(0, limit) : offers;
  }

  async listMine(companyId: string) {
    return this.offersRepo.find({
      where: { companyId },
      order: { createdAt: "DESC" },
    });
  }

  async listMineForUser(userId: string) {
    const company = await this.usersService.getCompanyProfile(userId);
    return this.listMine(company.id);
  }

  async findById(id: string) {
    const offer = await this.offersRepo.findOne({ where: { id }, relations: ["company"] });
    if (!offer) throw new NotFoundException("La oferta no existe.");
    return offer;
  }

  async create(userId: string, dto: CreateOfferDto) {
    const company = await this.usersService.getCompanyProfile(userId);

    const limit = await this.plansService.getActiveOffersLimit(userId);
    if (limit != null) {
      const activeCount = await this.offersRepo.count({
        where: { companyId: company.id, status: OfferStatus.ACTIVA },
      });
      if (activeCount >= limit) {
        throw new ForbiddenException(
          `Alcanzaste el límite de ${limit} oferta(s) activa(s) de tu plan actual. Mejorá tu plan para publicar más.`,
        );
      }
    }

    const offer = this.offersRepo.create({ ...dto, companyId: company.id });
    return this.offersRepo.save(offer);
  }

  async setStatus(userId: string, offerId: string, status: OfferStatus) {
    const company = await this.usersService.getCompanyProfile(userId);
    const offer = await this.findById(offerId);
    if (offer.companyId !== company.id) {
      throw new ForbiddenException("Esta oferta no te pertenece.");
    }

    if (status === OfferStatus.ACTIVA && offer.status !== OfferStatus.ACTIVA) {
      const limit = await this.plansService.getActiveOffersLimit(userId);
      if (limit != null) {
        const activeCount = await this.offersRepo.count({
          where: { companyId: company.id, status: OfferStatus.ACTIVA },
        });
        if (activeCount >= limit) {
          throw new ForbiddenException(
            `Alcanzaste el límite de ${limit} oferta(s) activa(s) de tu plan actual. Mejorá tu plan para reabrir esta oferta.`,
          );
        }
      }
    }

    offer.status = status;
    return this.offersRepo.save(offer);
  }
}
