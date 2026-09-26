import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { OffersModule } from "./offers/offers.module";
import { ApplicationsModule } from "./applications/applications.module";
import { AgreementsModule } from "./agreements/agreements.module";
import { PlansModule } from "./plans/plans.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST", "localhost"),
        port: config.get<number>("DB_PORT", 5432),
        username: config.get<string>("DB_USER", "praxislink"),
        password: config.get<string>("DB_PASSWORD", "praxislink"),
        database: config.get<string>("DB_NAME", "praxislink"),
        autoLoadEntities: true,
        // Prototipo académico: sincroniza el esquema automáticamente.
        // En un entorno productivo esto se reemplaza por migraciones.
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    PlansModule,
    OffersModule,
    ApplicationsModule,
    AgreementsModule,
    UploadsModule,
  ],
})
export class AppModule {}
