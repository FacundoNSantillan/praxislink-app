import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Application } from "./entities/application.entity";
import { ApplicationsService } from "./applications.service";
import { ApplicationsController } from "./applications.controller";
import { UsersModule } from "../users/users.module";
import { OffersModule } from "../offers/offers.module";

@Module({
  imports: [TypeOrmModule.forFeature([Application]), UsersModule, OffersModule],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
