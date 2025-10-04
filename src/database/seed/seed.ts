import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { Country } from '../../locations/entities/country.entity';
import { City } from '../../locations/entities/city.entity';
import { Airport } from '../../locations/entities/airport.entity';
import { Company } from '../../companies/entities/company.entity';
import { Plane } from '../../companies/entities/plane.entity';
import { Seat } from '../../companies/entities/seat.entity';
import { TravelClass } from '../../classes/entities/travel-class.entity';
import { TravelClassName } from '../../common/constants';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ds = app.get(DataSource);
  console.log('Seeding...');

  const clRepo = ds.getRepository(TravelClass);
  const classes = await clRepo.find();
  if (!classes.length) {
    await clRepo.save([
      { name: TravelClassName.ECONOM, multiplier: 1.0 },
      { name: TravelClassName.BUSINESS, multiplier: 1.5 },
      { name: TravelClassName.VIP, multiplier: 2.0 },
    ]);
  }
  const [eco, biz, vip] = await clRepo.find({ order: { name: 'ASC' } });

  const cRepo = ds.getRepository(Country);
  const uz = await cRepo.save({ name: 'Uzbekistan', code: 'UZ' });
  const cityRepo = ds.getRepository(City);
  const tk = await cityRepo.save({ name: 'Tashkent', country: uz });
  const sm = await cityRepo.save({ name: 'Samarkand', country: uz });

  const aRepo = ds.getRepository(Airport);
  const TAS = await aRepo.save({
    name: 'Tashkent International Airport',
    code: 'TAS',
    city: tk,
    latitude: 41.257900,
    longitude: 69.281197,
  });
  const SKD = await aRepo.save({
    name: 'Samarkand International Airport',
    code: 'SKD',
    city: sm,
    latitude: 39.700500,
    longitude: 66.983002,
  });

  const compRepo = ds.getRepository(Company);
  const uzAir = await compRepo.save({ name: 'Uzbekistan Airways', description: 'Flag carrier of Uzbekistan' });

  const planeRepo = ds.getRepository(Plane);
  const plane = await planeRepo.save({ model: 'Airbus A320', totalSeats: 180, company: uzAir });

  const seatRepo = ds.getRepository(Seat);
  const seats: Partial<Seat>[] = [];
  const letters = ['A','B','C','D','E','F'];
  for (let row = 1; row <= 30; row++) {
    for (const letter of letters) {
      const seatNumber = `${row}${letter}`;
      const klass = row <= 3 ? vip : row <= 10 ? biz : eco;
      seats.push({ seatNumber, travelClass: klass, plane });
    }
  }
  await seatRepo.save(seats);

  const fRepo = ds.getRepository('flights');
  const dep = new Date(); dep.setDate(dep.getDate() + 7); dep.setHours(9,0,0,0);
  const arr = new Date(dep.getTime() + 60 * 60 * 1000);
  await ds.query(
    `INSERT INTO flights ("flightNumber","companyId","departureAirportId","arrivalAirportId","departureTime","arrivalTime","planeId","status","basePrice")
     VALUES ($1,$2,$3,$4,$5,$6,$7,'SCHEDULED', $8)`,
    ['HY101', uzAir.id, TAS.id, SKD.id, dep.toISOString(), arr.toISOString(), plane.id, 120.00]
  );

  const dep2 = new Date(); dep2.setDate(dep2.getDate() + 14); dep2.setHours(18,0,0,0);
  const arr2 = new Date(dep2.getTime() + 65*60*1000);
  await ds.query(
    `INSERT INTO flights ("flightNumber","companyId","departureAirportId","arrivalAirportId","departureTime","arrivalTime","planeId","status","basePrice")
     VALUES ($1,$2,$3,$4,$5,$6,$7,'SCHEDULED', $8)`,
    ['HY102', uzAir.id, SKD.id, TAS.id, dep2.toISOString(), arr2.toISOString(), plane.id, 110.00]
  );

  console.log('Seed completed.');
  await app.close();
}
bootstrap();
