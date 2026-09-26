import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Plan } from "./entities/plan.entity";
import { Subscription } from "./entities/subscription.entity";
import { SubscriptionStatus, UserRole } from "../common/enums";

const DEFAULT_PLANS: Array<Partial<Plan>> = [
  {
    role: UserRole.EMPRESA,
    name: "Gratuita",
    description: "Para empezar a probar la plataforma.",
    priceArs: 0,
    maxActiveOffers: 1,
    maxVisibleOffers: null,
    sortOrder: 0,
  },
  {
    role: UserRole.EMPRESA,
    name: "Profesional",
    description: "Para empresas que reclutan de forma constante.",
    priceArs: 15000,
    maxActiveOffers: 5,
    maxVisibleOffers: null,
    sortOrder: 1,
  },
  {
    role: UserRole.EMPRESA,
    name: "Ilimitada",
    description: "Ofertas activas sin límite y prioridad en el matching.",
    priceArs: 35000,
    maxActiveOffers: null,
    maxVisibleOffers: null,
    sortOrder: 2,
  },
  {
    role: UserRole.UNIVERSIDAD,
    name: "Básica",
    description: "Acceso a las oportunidades más recientes para tus alumnos.",
    priceArs: 0,
    maxActiveOffers: null,
    maxVisibleOffers: 10,
    sortOrder: 0,
  },
  {
    role: UserRole.UNIVERSIDAD,
    name: "Convenio Plus",
    description: "Más ofertas visibles y prioridad para tus alumnos.",
    priceArs: 20000,
    maxActiveOffers: null,
    maxVisibleOffers: 40,
    sortOrder: 1,
  },
  {
    role: UserRole.UNIVERSIDAD,
    name: "Convenio Total",
    description: "Todas las ofertas de la red, sin límite.",
    priceArs: 45000,
    maxActiveOffers: null,
    maxVisibleOffers: null,
    sortOrder: 2,
  },
];

@Injectable()
export class PlansService implements OnModuleInit {
  constructor(
    @InjectRepository(Plan) private plansRepo: Repository<Plan>,
    @InjectRepository(Subscription) private subsRepo: Repository<Subscription>,
  ) {}

  async onModuleInit() {
    const count = await this.plansRepo.count();
    if (count === 0) {
      await this.plansRepo.save(this.plansRepo.create(DEFAULT_PLANS));
    }
  }

  getPlansForRole(role: UserRole) {
    return this.plansRepo.find({ where: { role }, order: { sortOrder: "ASC" } });
  }

  private getFreePlan(role: UserRole) {
    return this.plansRepo.findOne({ where: { role, priceArs: 0 } });
  }

  async getMySubscription(userId: string, role: UserRole) {
    const active = await this.subsRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVA },
      order: { startedAt: "DESC" },
    });
    if (active) return active;

    // Sin suscripción explícita: plan gratuito por defecto.
    const freePlan = await this.getFreePlan(role);
    return { id: null, userId, plan: freePlan, planId: freePlan?.id, status: SubscriptionStatus.ACTIVA, startedAt: null };
  }

  async subscribe(userId: string, role: UserRole, planId: string) {
    const plan = await this.plansRepo.findOne({ where: { id: planId } });
    if (!plan) throw new BadRequestException("El plan seleccionado no existe.");
    if (plan.role !== role) throw new BadRequestException("Ese plan no corresponde a tu tipo de cuenta.");

    // Simulación de pago: se aprueba al instante (no hay integración con una pasarela real).
    await this.subsRepo.update({ userId, status: SubscriptionStatus.ACTIVA }, { status: SubscriptionStatus.CANCELADA });
    const subscription = await this.subsRepo.save(
      this.subsRepo.create({ userId, planId: plan.id, status: SubscriptionStatus.ACTIVA }),
    );
    return { ...subscription, plan };
  }

  async getActiveOffersLimit(userId: string): Promise<number | null> {
    const sub = await this.getMySubscription(userId, UserRole.EMPRESA);
    return sub.plan?.maxActiveOffers ?? null;
  }

  async getVisibleOffersLimit(userId: string): Promise<number | null> {
    const sub = await this.getMySubscription(userId, UserRole.UNIVERSIDAD);
    return sub.plan?.maxVisibleOffers ?? null;
  }
}
