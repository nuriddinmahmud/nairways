import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('USER','ADMIN','SUPER_ADMIN')`);
    await queryRunner.query(`CREATE TYPE "loyalty_tier_enum" AS ENUM ('BRONZE','SILVER','GOLD')`);
    await queryRunner.query(`CREATE TYPE "flight_status_enum" AS ENUM ('SCHEDULED','DELAYED','CANCELLED')`);
    await queryRunner.query(`CREATE TYPE "class_name_enum" AS ENUM ('ECONOM','BUSINESS','VIP')`);
    await queryRunner.query(`CREATE TYPE "payment_status_enum" AS ENUM ('PENDING','PAID','REFUNDED')`);

    await queryRunner.query(`
      CREATE TABLE countries (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(80) NOT NULL,
        code varchar(3) NOT NULL UNIQUE,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE cities (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(120) NOT NULL,
        "countryId" uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now(),
        UNIQUE(name,"countryId")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE airports (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(140) NOT NULL,
        code varchar(10) NOT NULL UNIQUE,
        "cityId" uuid REFERENCES cities(id) ON DELETE CASCADE,
        latitude numeric(10,6),
        longitude numeric(10,6),
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        username varchar(80) NOT NULL UNIQUE,
        email varchar(120) NOT NULL UNIQUE,
        password varchar NOT NULL,
        role user_role_enum NOT NULL DEFAULT 'USER',
        "fullName" varchar,
        phone varchar,
        "loyaltyPoints" int NOT NULL DEFAULT 0,
        tier loyalty_tier_enum NOT NULL DEFAULT 'BRONZE',
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now(),
        "deletedAt" timestamptz
      )
    `);

    await queryRunner.query(`
      CREATE TABLE companies (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(140) UNIQUE NOT NULL,
        description text,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE planes (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        model varchar(140) NOT NULL,
        "totalSeats" int NOT NULL,
        "companyId" uuid REFERENCES companies(id) ON DELETE CASCADE,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE travel_classes (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name class_name_enum NOT NULL UNIQUE,
        multiplier numeric(5,2) NOT NULL DEFAULT 1.0,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE seats (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "seatNumber" varchar(6) NOT NULL,
        "travelClassId" uuid NOT NULL REFERENCES travel_classes(id),
        "planeId" uuid NOT NULL REFERENCES planes(id) ON DELETE CASCADE,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now(),
        UNIQUE("planeId","seatNumber")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE flights (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "flightNumber" varchar(12) NOT NULL UNIQUE,
        "companyId" uuid REFERENCES companies(id),
        "departureAirportId" uuid NOT NULL REFERENCES airports(id),
        "arrivalAirportId" uuid NOT NULL REFERENCES airports(id),
        "departureTime" timestamptz NOT NULL,
        "arrivalTime" timestamptz NOT NULL,
        "planeId" uuid NOT NULL REFERENCES planes(id),
        status flight_status_enum NOT NULL DEFAULT 'SCHEDULED',
        "basePrice" numeric(10,2) NOT NULL,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now()
      );
      CREATE INDEX ON flights("departureTime");
      CREATE INDEX ON flights("arrivalTime");
      CREATE INDEX ON flights(status);
    `);

    await queryRunner.query(`
      CREATE TABLE bookings (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "flightId" uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
        "seatId" uuid NOT NULL REFERENCES seats(id),
        "travelClassId" uuid NOT NULL REFERENCES travel_classes(id),
        price numeric(10,2) NOT NULL,
        "isRoundTrip" boolean NOT NULL DEFAULT false,
        "linkedBookingId" uuid,
        "paymentStatus" payment_status_enum NOT NULL DEFAULT 'PENDING',
        meta jsonb,
        version int NOT NULL DEFAULT 1,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now(),
        "deletedAt" timestamptz
      );
      CREATE UNIQUE INDEX uniq_active_seat_flight ON bookings("flightId","seatId")
        WHERE "paymentStatus" IN ('PENDING','PAID');
    `);

    await queryRunner.query(`
      CREATE TABLE reviews (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "flightId" uuid NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
        rating smallint NOT NULL,
        comment text,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now(),
        UNIQUE ("flightId","userId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE news (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title varchar(200) NOT NULL,
        content text NOT NULL,
        "authorId" uuid REFERENCES users(id) ON DELETE SET NULL,
        "publishedAt" timestamptz,
        "imageUrl" varchar,
        "createdAt" timestamptz DEFAULT now(),
        "updatedAt" timestamptz DEFAULT now(),
        "deletedAt" timestamptz
      );
      CREATE INDEX ON news("publishedAt");
    `);

    await queryRunner.query(`
      CREATE TABLE loyalty_transactions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        points int NOT NULL,
        type varchar(12) NOT NULL,
        reason text,
        "createdAt" timestamptz DEFAULT now()
      )
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE loyalty_transactions`);
    await q.query(`DROP TABLE news`);
    await q.query(`DROP TABLE reviews`);
    await q.query(`DROP INDEX IF EXISTS uniq_active_seat_flight`);
    await q.query(`DROP TABLE bookings`);
    await q.query(`DROP TABLE flights`);
    await q.query(`DROP TABLE seats`);
    await q.query(`DROP TABLE travel_classes`);
    await q.query(`DROP TABLE planes`);
    await q.query(`DROP TABLE companies`);
    await q.query(`DROP TABLE airports`);
    await q.query(`DROP TABLE cities`);
    await q.query(`DROP TABLE countries`);
    await q.query(`DROP TYPE payment_status_enum`);
    await q.query(`DROP TYPE class_name_enum`);
    await q.query(`DROP TYPE flight_status_enum`);
    await q.query(`DROP TYPE loyalty_tier_enum`);
    await q.query(`DROP TYPE user_role_enum`);
  }
}
