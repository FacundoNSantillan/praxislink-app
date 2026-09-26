import { BadRequestException, Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "../common/enums";
import { PlansService } from "./plans.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("plans")
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Roles(UserRole.EMPRESA, UserRole.UNIVERSIDAD)
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.plansService.getPlansForRole(user.role as UserRole);
  }

  @Roles(UserRole.EMPRESA, UserRole.UNIVERSIDAD)
  @Get("me")
  mySubscription(@CurrentUser() user: AuthUser) {
    return this.plansService.getMySubscription(user.id, user.role as UserRole);
  }

  @Roles(UserRole.EMPRESA, UserRole.UNIVERSIDAD)
  @Post("subscribe")
  subscribe(@CurrentUser() user: AuthUser, @Body("planId") planId: string) {
    if (!planId) throw new BadRequestException("Falta indicar el plan a contratar.");
    return this.plansService.subscribe(user.id, user.role as UserRole, planId);
  }
}
