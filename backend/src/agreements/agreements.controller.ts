import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "../common/enums";
import { AgreementsService } from "./agreements.service";
import { CreateAgreementDto } from "./dto/create-agreement.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.UNIVERSIDAD)
@Controller("agreements")
export class AgreementsController {
  constructor(private agreementsService: AgreementsService) {}

  @Get("mine")
  listMine(@CurrentUser() user: AuthUser) {
    return this.agreementsService.listMine(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAgreementDto) {
    return this.agreementsService.create(user.id, dto);
  }

  @Patch(":id/sign")
  markSigned(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.agreementsService.markSigned(user.id, id);
  }
}
