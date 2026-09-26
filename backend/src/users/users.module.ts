import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { CompanyProfile } from "./entities/company-profile.entity";
import { StudentProfile } from "./entities/student-profile.entity";
import { UniversityProfile } from "./entities/university-profile.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PublicController } from "./public.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User, CompanyProfile, StudentProfile, UniversityProfile])],
  providers: [UsersService],
  controllers: [UsersController, PublicController],
  exports: [UsersService],
})
export class UsersModule {}
