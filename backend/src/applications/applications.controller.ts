import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../auth/decorators/current-user.decorator";
import { ApplicationStatus, UserRole } from "../common/enums";
import { ApplicationsService } from "./applications.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UsersService } from "../users/users.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("applications")
export class ApplicationsController {
  constructor(
    private applicationsService: ApplicationsService,
    private usersService: UsersService,
  ) {}

  @Roles(UserRole.ESTUDIANTE)
  @Post()
  apply(@CurrentUser() user: AuthUser, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.apply(user.id, dto);
  }

  @Roles(UserRole.ESTUDIANTE)
  @Get("mine")
  listMine(@CurrentUser() user: AuthUser) {
    return this.applicationsService.listMine(user.id);
  }

  @Roles(UserRole.ESTUDIANTE)
  @Get("applied-offer-ids")
  listAppliedOfferIds(@CurrentUser() user: AuthUser) {
    return this.applicationsService.listAppliedOfferIds(user.id);
  }

  @Roles(UserRole.EMPRESA)
  @Get("offer/:offerId")
  listForOffer(@CurrentUser() user: AuthUser, @Param("offerId") offerId: string) {
    return this.applicationsService.listForOffer(user.id, offerId);
  }

  @Roles(UserRole.EMPRESA)
  @Get("company")
  listForCompany(@CurrentUser() user: AuthUser) {
    return this.applicationsService.listForCompany(user.id);
  }

  @Roles(UserRole.EMPRESA)
  @Patch(":id/status")
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body("status") status: ApplicationStatus,
  ) {
    return this.applicationsService.updateStatus(user.id, id, status);
  }

  @Roles(UserRole.UNIVERSIDAD)
  @Get("university-students")
  async listForUniversityStudents(@CurrentUser() user: AuthUser) {
    const university = await this.usersService.getUniversityProfile(user.id);
    return this.applicationsService.listForUniversityStudents(university.name);
  }
}
