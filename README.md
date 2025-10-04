# Airways System — Uchish va Bronlash Platformasi

> NestJS · TypeORM · PostgreSQL — Redis ishlatilmaydi

## Umumiy maʼlumot
Airways System — aviachipta sotish, parvozlarni boshqarish va mijozlarning sodiqlik balllarini yuritish uchun ishlab chiqilgan backend xizmatidir. Platforma modul tarzda qurilgan bo‘lib, foydalanuvchi autentifikatsiyasi, rol asosidagi ruxsat, bronlash jarayonlari, kompaniya va parkni boshqarish hamda admin paneli uchun to‘liq REST API bilan taʼminlaydi. Swagger hujjatlari orqali barcha endpointlarni bir joydan sinovdan o‘tkazish mumkin.

## Asosiy imkoniyatlar
- **JWT autentifikatsiyasi**: access/refresh tokenlar, `USER` / `ADMIN` / `SUPER_ADMIN` rollari.
- **Modullar**: Auth, Users, Flights, Bookings, Tickets, Companies (planes & seats), Locations, News, Reviews, Loyalty va boshqalar.
- **Maʼlumotlar bazasi**: PostgreSQL, TypeORM migratsiyalari, soft-delete va unique indekslar.
- **Sodiqlik tizimi**: Ballarni yig‘ish, yechish va avtomatik tier hisoblash.
- **To‘lov va xabarnoma**: Mock payment va email xizmati (real integratsiya uchun tayyor interfeyslar).
- **Monitoring**: Winston loglari, global exception filter, response interceptor.
- **Swagger**: `http://localhost:3000/api/docs` manzilda interaktiv hujjatlar va mock request/shablonlar.

## Texnologiyalar
- **Runtime**: Node.js 20+
- **Framework**: NestJS 10
- **ORM**: TypeORM 0.3
- **DB**: PostgreSQL 14+
- **Autentifikatsiya**: `@nestjs/jwt`, Passport JWT
- **Hujjat**: `@nestjs/swagger`
- **Test**: Jest (unit/e2e shablonlari)

## Papka tuzilishi
```
src/
 ├─ auth/              # login, register, refresh
 ├─ users/             # foydalanuvchi profili, admin boshqaruvi
 ├─ flights/           # parvozlar, qidiruv, bekor qilish
 ├─ bookings/          # bronlash jarayoni, ball ishlatish
 ├─ tickets/           # bron asosida chipta yaratish
 ├─ companies/         # aviakompaniya, samolyot, o‘rindiqlar
 ├─ locations/         # mamlakat, shahar, aeroportlar
 ├─ loyalty/           # ballar tarixi va tierlar
 ├─ news/              # yangiliklar (slug bilan)
 ├─ reviews/           # parvoz sharhlari
 ├─ classes/           # tarif/klass koeffitsientlari
 ├─ common/            # dekorator, guard, util, filter, interceptor
 └─ database/          # data source va migratsiyalar
```

## O‘rnatish va ishga tushirish
```bash
cp .env.example .env   # sozlamalarni moslang
npm install
npm run build          # TypeScript transpile
npm run start:dev      # hot-reload rejimi
```

### Muhit sozlamalari (`.env`)
```
APP_PORT=3000
NODE_ENV=development

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=imtixon
POSTGRES_USER=postgres
POSTGRES_PASSWORD=12345678

JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```
`ConfigModule` `.env` faylni o‘qiydi va `class-validator` asosidagi `validateEnv` bilan tekshiradi.

### Migratsiyalar
- Har ishga tushishda `migrationsRun: true` bo‘lgani sababli mavjud migratsiyalar avtomatik bajariladi.
- Qo‘lda ishga tushirish:
  ```bash
  npm run typeorm:run
  npm run typeorm:revert   # kerak bo‘lsa ortga qaytish
  ```
- So‘nggi migratsiya (`1717000000000-AddBalanceFlightCancelSlug.ts`) quyidagi ustunlarni qo‘shadi:
  - `users.balance` (numeric)
  - `flights.cancelReason` (text)
  - `news.slug` (unique index bilan)

## Ishga tushirish ssenariylari
| Buyruq | Maqsad |
| --- | --- |
| `npm run start:dev` | Watch mode, hot reload |
| `npm run start` | Prod buildni ishga tushirish |
| `npm run build` | TypeScript -> JavaScript |
| `npm run lint` | ESLint tekshiruvi |
| `npm run test` | Jest testlari |
| `npm run seed` | Demo maʼlumotlarni kiritish |

## Swagger va API hujjatlari
- Swagger UI: **`http://localhost:3000/api/docs`**
- Konsolda servis ishga tushganda `Swagger docs ready at ...` logi ko‘rinadi.
- Har bir DTO uchun `@ApiProperty` misollari qo‘shilgan — “Example Value” bo‘limida real formatdagi request ko‘rishingiz mumkin.
- Root (`/`) ga kirganda avtomatik Swagger sahifasiga yo‘naltirilasiz.

## Modullar va API yo‘llari
Quyidagi jadval asosiy endpointlarni jamlaydi (barcha yo‘llar `api` prefiksi ostida):

| Modul | Endpointlar (metod) |
| --- | --- |
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/admin/register`, `POST /auth/admin/login`, `POST /auth/refresh`, `POST /auth/logout` |
| **Users** | `GET /users/me`, `PATCH /users/me`, `POST /users/{id}/balance` |
| **Admin** | `GET /admin/admins`, `GET /admin/admins/{id}`, `POST /admin/admins`, `PATCH /admin/admins/{id}/promote`, `PATCH /admin/admins/{id}/demote`, `DELETE /admin/admins/{id}` |
| **Flights** | `GET /flights`, `GET /flights/search`, `GET /flights/{id}`, `GET /flights/{id}/seats`, `POST /flights`, `PATCH /flights/{id}`, `DELETE /flights/{id}`, `POST /flights/{id}/cancel`, `GET /search` |
| **Bookings** | `POST /bookings`, `GET /bookings/mine`, `GET /bookings/{flightId}/seats`, `POST /bookings/{id}/assign-seat`, `POST /bookings/{id}/change-seat`, `POST /bookings/{id}/cancel` |
| **Tickets** | `POST /tickets`, `GET /tickets/mine` |
| **Companies** | `GET /companies`, `POST /companies`, `GET /companies/{id}`, `PATCH /companies/{id}`, `DELETE /companies/{id}`, hamda kompaniya bo‘yicha planes/seats CRUD |
| **Planes / Seats (global)** | `GET /planes`, `POST /planes`, `GET /planes/{id}`, `PATCH /planes/{id}`, `DELETE /planes/{id}`, `GET /seats`, `POST /seats`, `GET /seats/{id}`, `PATCH /seats/{id}`, `DELETE /seats/{id}` |
| **Locations** | `countries`, `cities`, `airports` uchun to‘liq CRUD |
| **Classes** | `GET /classes`, `POST /classes`, `GET /classes/{id}`, `PATCH /classes/{id}`, `DELETE /classes/{id}` |
| **Loyalty** | `GET /loyalty/me` |
| **News** | `GET /news`, `GET /news/{slug}`, `GET /news/admin/all`, `POST /news`, `POST /news/{id}`, `POST /news/{id}/delete` |
| **Reviews** | `POST /reviews`, `GET /reviews`, `GET /reviews/flight/{id}`, `DELETE /reviews/{id}` |

> **Eslatma:** Guard va rol talab qiladigan endpointlar Swagger’da `Authorize` tugmasi orqali JWT kiritilgandan so‘ng faollashadi.

## Bronlash jarayoni (qisqa ketma-ketlik)
1. Foydalanuvchi `POST /auth/register` → email + parol bilan ro‘yxatdan o‘tadi.
2. `POST /auth/login` orqali access/refresh tokenlar olinadi.
3. `GET /flights/search` orqali mos parvoz topiladi.
4. `POST /bookings` request (klass, o‘rindiq, ball ishlatish) — mock to‘lov amalga oshadi.
5. Agar `redeemPoints` berilgan bo‘lsa, Loyalty servisi ballarni yechadi, so‘ng yangi ball qo‘shadi.
6. Zarur bo‘lsa `POST /tickets` bilan chipta PDF (mock) yaratiladi.

## Maʼlumotlar bazasi eslatmalari
- Flight double-booking: `uniq_active_seat_flight` indeksi + tranzaksiya.
- Users jadvali soft delete qo‘llaydi (`deletedAt`).
- Ticketlar unikal `code` ga ega (service generator orqali).
- News slug ustuni migratsiya orqali yaratiladi va takrorlanmasligi taʼminlanadi.

## Test va sifat
- `npm run lint` — ESLint (import tartibi, Nest qoidalari, Prettier bilan mos).
- `npm run test` — Jest (unit) (hozircha asosiy modullar uchun bo‘sh shablonlar, kerak bo‘lsa to‘ldiring).
- CI/CD uchun `npm run build` + `npm run lint` ketma-ketligi tavsiya etiladi.

## Kengaytirish bo‘yicha tavsiyalar
- **Caching**: Redis yoki boshqa cache layer qo‘shish uchun `CacheModule` ni modul asosida ishga tushiring.
- **Real payment/email**: Mock sinflar o‘rniga Stripe/Mailgun integratsiyalarini `PaymentService` va `MailService` interfeyslariga implement qiling.
- **Monitoring**: Winston loglariga qo‘shimcha ravishda Grafana/Prometheus yoki Sentry integratsiyasi qo‘shish mumkin.

## Muammolarni bartaraf etish
| Belgilari | Yechim |
| --- | --- |
| `column "balance" does not exist` | `npm run typeorm:run` bilan so‘nggi migratsiyani ishga tushiring |
| `connect EPERM ... 5432` | Lokal PostgreSQL ishlayotganini va sandbox cheklovlari yo‘qligini tekshiring |
| Swagger’da 401 | `Authorize` orqali access token kiriting |
| Seat double-booking | Unique indeks va tranzaksiya ishlayapti, ammo testing paytida parallel requestlar bilan ehtiyot bo‘ling |

## Litsenziya
Loyiha taʼlimiy maqsadlar uchun yaratilgan. O‘z ehtiyojingizga mos ravishda kengaytirishingiz mumkin.

