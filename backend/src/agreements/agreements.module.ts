import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agreement } from "./entities/agreement.entity";
import { AgreementsService } from "./agreements.service";
import { AgreementsController } from "./agreements.controller";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Agreement]), UsersModule],
  providers: [AgreementsService],
  controllers: [AgreementsController],
})
export class AgreementsModule {}
