import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config/configuration";
import { validateEnv } from "./config/validation";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WinstonModule } from "nest-winston";
import { buildWinstonLogger } from "./common/logging/winston";
import { join } from "path";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { LocationsModule } from "./locations/locations.module";
import { CompaniesModule } from "./companies/companies.module";
import { ClassesModule } from "./classes/classes.module";
import { FlightsModule } from "./flights/flights.module";
import { BookingsModule } from "./bookings/bookings.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { NewsModule } from "./news/news.module";
import { LoyaltyModule } from "./loyalty/loyalty.module";
import { MailModule } from "./mail/mail.module";
import { AdminModule } from "./admin/admin.module";
import { TicketsModule } from "./tickets/tickets.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, "..", ".env"),
      load: [configuration],
      validate: validateEnv,
    }),
    WinstonModule.forRoot(buildWinstonLogger()),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: "postgres",
        host: cfg.get("database.host"),
        port: cfg.get("database.port"),
        username: cfg.get("database.user"),
        password: cfg.get("database.password"),
        database: cfg.get("database.name"),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
        migrations: [join(__dirname, "database/migrations/*.js")],
        logging: ["error", "warn"],
      }),
    }),
    MailModule,
    AuthModule,
    UsersModule,
    LocationsModule,
    CompaniesModule,
    ClassesModule,
    FlightsModule,
    BookingsModule,
    ReviewsModule,
    NewsModule,
    LoyaltyModule,
    AdminModule,
    TicketsModule,
  ],
})
export class AppModule {}
