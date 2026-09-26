import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../auth/decorators/current-user.decorator";
import { OfferStatus, UserRole } from "../common/enums";
import { OffersService } from "./offers.service";
import { CreateOfferDto } from "./dto/create-offer.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("offers")
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Roles(UserRole.ESTUDIANTE)
  @Get()
  listActive(@Query("area") area?: string, @Query("type") type?: string, @Query("q") q?: string) {
    return this.offersService.listActive({ area, type, q });
  }

  @Roles(UserRole.UNIVERSIDAD)
  @Get("for-university")
  listForUniversity(
    @CurrentUser() user: AuthUser,
    @Query("area") area?: string,
    @Query("type") type?: string,
    @Query("q") q?: string,
  ) {
    return this.offersService.listForUniversity(user.id, { area, type, q });
  }

  @Roles(UserRole.EMPRESA)
  @Get("mine")
  listMine(@CurrentUser() user: AuthUser) {
    return this.offersService.listMineForUser(user.id);
  }

  @Roles(UserRole.EMPRESA)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOfferDto) {
    return this.offersService.create(user.id, dto);
  }

  @Roles(UserRole.EMPRESA)
  @Patch(":id/status")
  setStatus(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body("status") status: OfferStatus) {
    return this.offersService.setStatus(user.id, id, status);
  }
}
