import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { Offer } from "../offers/entities/offer.entity";
import { Application } from "../applications/entities/application.entity";
import { Agreement } from "../agreements/entities/agreement.entity";
import { Subscription } from "../plans/entities/subscription.entity";
import { PlansModule } from "../plans/plans.module";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User, Offer, Application, Agreement, Subscription]), PlansModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
