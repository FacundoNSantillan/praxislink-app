import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser, AuthUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "../common/enums";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("companies")
  listCompanies() {
    return this.usersService.listCompaniesBasic();
  }

  @Roles(UserRole.EMPRESA)
  @Get("companies/me")
  getMyCompanyProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getCompanyProfile(user.id);
  }

  @Roles(UserRole.EMPRESA)
  @Patch("companies/me")
  updateMyCompanyProfile(@CurrentUser() user: AuthUser, @Body() body: Record<string, unknown>) {
    const { name, rubro, site, size, description } = body;
    return this.usersService.updateCompanyProfile(user.id, {
      ...(name !== undefined && { name: String(name) }),
      ...(rubro !== undefined && { rubro: String(rubro) }),
      ...(site !== undefined && { site: String(site) }),
      ...(size !== undefined && { size: String(size) }),
      ...(description !== undefined && { description: String(description) }),
    });
  }

  @Roles(UserRole.ESTUDIANTE)
  @Get("students/me")
  getMyStudentProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getStudentProfile(user.id);
  }

  @Roles(UserRole.ESTUDIANTE)
  @Patch("students/me")
  updateMyStudentProfile(@CurrentUser() user: AuthUser, @Body() body: Record<string, unknown>) {
    const { name, university, career, year, location, availability, skills } = body;
    return this.usersService.updateStudentProfile(user.id, {
      ...(name !== undefined && { name: String(name) }),
      ...(university !== undefined && { university: String(university) }),
      ...(career !== undefined && { career: String(career) }),
      ...(year !== undefined && { year: String(year) }),
      ...(location !== undefined && { location: String(location) }),
      ...(availability !== undefined && { availability: String(availability) }),
      ...(Array.isArray(skills) && { skills: skills.map(String) }),
    });
  }

  @Roles(UserRole.UNIVERSIDAD)
  @Get("universities/me")
  getMyUniversityProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getUniversityProfile(user.id);
  }

  @Roles(UserRole.UNIVERSIDAD)
  @Patch("universities/me")
  updateMyUniversityProfile(@CurrentUser() user: AuthUser, @Body() body: Record<string, unknown>) {
    const { name, location, description } = body;
    return this.usersService.updateUniversityProfile(user.id, {
      ...(name !== undefined && { name: String(name) }),
      ...(location !== undefined && { location: String(location) }),
      ...(description !== undefined && { description: String(description) }),
    });
  }
}
