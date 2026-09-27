import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Offer } from "../offers/entities/offer.entity";
import { Application } from "../applications/entities/application.entity";
import { Agreement } from "../agreements/entities/agreement.entity";
import { Subscription } from "../plans/entities/subscription.entity";
import { OfferStatus, SubscriptionStatus, UserRole } from "../common/enums";
import { PlansService } from "../plans/plans.service";

export interface AdminUserRow {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  name: string;
  extra: string;
  plan: { name: string; priceArs: number } | null;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    @InjectRepository(Application) private applicationsRepo: Repository<Application>,
    @InjectRepository(Agreement) private agreementsRepo: Repository<Agreement>,
    @InjectRepository(Subscription) private subsRepo: Repository<Subscription>,
    private plansService: PlansService,
  ) {}

  async listUsers(): Promise<AdminUserRow[]> {
    const users = await this.usersRepo.find({
      relations: ["companyProfile", "studentProfile", "universityProfile"],
      order: { createdAt: "DESC" },
    });

    const rows: AdminUserRow[] = [];
    for (const u of users) {
      let name = "—";
      let extra = "";

      if (u.role === UserRole.EMPRESA && u.companyProfile) {
        name = u.companyProfile.name;
        extra = u.companyProfile.rubro || "";
      } else if (u.role === UserRole.ESTUDIANTE && u.studentProfile) {
        name = u.studentProfile.name;
        extra = u.studentProfile.university || "";
      } else if (u.role === UserRole.UNIVERSIDAD && u.universityProfile) {
        name = u.universityProfile.name;
        extra = u.universityProfile.location || "";
      } else if (u.role === UserRole.ADMIN) {
        name = "Administrador";
      }

      let plan: AdminUserRow["plan"] = null;
      if (u.role === UserRole.EMPRESA || u.role === UserRole.UNIVERSIDAD) {
        const sub = await this.plansService.getMySubscription(u.id, u.role);
        if (sub.plan) plan = { name: sub.plan.name, priceArs: sub.plan.priceArs };
      }

      rows.push({ id: u.id, email: u.email, role: u.role, createdAt: u.createdAt, name, extra, plan });
    }
    return rows;
  }

  async stats() {
    const [totalUsers, totalOffers, activeOffers, totalApplications, totalAgreements, activeSubs, usersByRole] =
      await Promise.all([
        this.usersRepo.count(),
        this.offersRepo.count(),
        this.offersRepo.count({ where: { status: OfferStatus.ACTIVA } }),
        this.applicationsRepo.count(),
        this.agreementsRepo.count(),
        this.subsRepo.find({ where: { status: SubscriptionStatus.ACTIVA }, relations: ["plan"] }),
        this.usersRepo
          .createQueryBuilder("u")
          .select("u.role", "role")
          .addSelect("COUNT(*)", "count")
          .groupBy("u.role")
          .getRawMany<{ role: UserRole; count: string }>(),
      ]);

    const monthlyRevenue = activeSubs
      .filter((s) => s.plan && s.plan.priceArs > 0)
      .reduce((sum, s) => sum + s.plan.priceArs, 0);
    const payingAccounts = activeSubs.filter((s) => s.plan && s.plan.priceArs > 0).length;

    return {
      totalUsers,
      totalOffers,
      activeOffers,
      totalApplications,
      totalAgreements,
      monthlyRevenue,
      payingAccounts,
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: Number(r.count) })),
    };
  }
}
