import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { AdminUsersController } from '../src/users/admin-users.controller';
import { FlightsController } from '../src/flights/flights.controller';
import { FlightsService } from '../src/flights/flights.service';
import { GlobalSearchController } from '../src/flights/search.controller';
import { BookingsController } from '../src/bookings/bookings.controller';
import { BookingsService } from '../src/bookings/bookings.service';
import { CompaniesController } from '../src/companies/companies.controller';
import { PlanesController } from '../src/companies/planes.controller';
import { SeatsController } from '../src/companies/seats.controller';
import { CompaniesService } from '../src/companies/companies.service';
import { CountriesController } from '../src/locations/countries.controller';
import { CitiesController } from '../src/locations/cities.controller';
import { AirportsController } from '../src/locations/airports.controller';
import { LocationsService } from '../src/locations/locations.service';
import { ClassesController } from '../src/classes/classes.controller';
import { ClassesService } from '../src/classes/classes.service';
import { ReviewsController } from '../src/reviews/reviews.controller';
import { ReviewsService } from '../src/reviews/reviews.service';
import { NewsController } from '../src/news/news.controller';
import { NewsService } from '../src/news/news.service';
import { LoyaltyController } from '../src/loyalty/loyalty.controller';
import { LoyaltyService } from '../src/loyalty/loyalty.service';
import { TicketsController } from '../src/tickets/tickets.controller';
import { UserRole } from '../src/common/constants';

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  beforeEach(() => {
    service = {
      register: jest.fn(),
      login: jest.fn(),
      registerAdmin: jest.fn(),
      loginAdmin: jest.fn(),
      logout: jest.fn(),
      refresh: jest.fn(),
    };
    controller = new AuthController(service);
  });

  it('register', async () => {
    const dto = { username: 'ali', email: 'ali@example.com', password: 'Secret123' } as any;
    const expected = { accessToken: 'token' } as any;
    service.register.mockResolvedValue(expected);
    await expect(controller.register(dto)).resolves.toBe(expected);
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('login', async () => {
    const dto = { email: 'ali@example.com', password: 'Secret123' } as any;
    const expected = { accessToken: 'token' } as any;
    service.login.mockResolvedValue(expected);
    await expect(controller.login(dto)).resolves.toBe(expected);
    expect(service.login).toHaveBeenCalledWith(dto.email, dto.password);
  });

  it('register admin', async () => {
    const dto = { username: 'admin', email: 'admin@example.com', password: 'Secret123' } as any;
    const expected = { accessToken: 'admin-token' } as any;
    service.registerAdmin.mockResolvedValue(expected);
    await expect(controller.registerAdmin(dto)).resolves.toBe(expected);
    expect(service.registerAdmin).toHaveBeenCalledWith(dto);
  });

  it('login admin', async () => {
    const dto = { email: 'admin@example.com', password: 'Secret123' } as any;
    const expected = { accessToken: 'admin-token' } as any;
    service.loginAdmin.mockResolvedValue(expected);
    await expect(controller.loginAdmin(dto)).resolves.toBe(expected);
    expect(service.loginAdmin).toHaveBeenCalledWith(dto.email, dto.password);
  });

  it('logout', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const expected = { ok: true } as any;
    service.logout.mockResolvedValue(expected);
    await expect(controller.logout(req)).resolves.toBe(expected);
    expect(service.logout).toHaveBeenCalledWith('user-1');
  });

  it('refresh', async () => {
    const payload = Buffer.from(JSON.stringify({ sub: 'user-1', jti: 'refresh-1' })).toString('base64');
    const dto = { refreshToken: `a.${payload}.c` } as any;
    const expected = { accessToken: 'new' } as any;
    service.refresh.mockResolvedValue(expected);
    await expect(controller.refresh(dto)).resolves.toBe(expected);
    expect(service.refresh).toHaveBeenCalledWith('user-1', 'refresh-1');
  });
});

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  beforeEach(() => {
    service = {
      findById: jest.fn(),
      updateProfile: jest.fn(),
      adjustBalance: jest.fn(),
      delete: jest.fn(),
    };
    controller = new UsersController(service);
  });

  it('getMe', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const expected = { id: 'user-1' } as any;
    service.findById.mockResolvedValue(expected);
    await expect(controller.getMe(req)).resolves.toBe(expected);
    expect(service.findById).toHaveBeenCalledWith('user-1');
  });

  it('updateMe', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const dto = { fullName: 'Ali' } as any;
    const expected = { id: 'user-1', fullName: 'Ali' } as any;
    service.updateProfile.mockResolvedValue(expected);
    await expect(controller.updateMe(req, dto)).resolves.toBe(expected);
    expect(service.updateProfile).toHaveBeenCalledWith('user-1', dto);
  });

  it('adjustBalance', async () => {
    const dto = { amount: 100 } as any;
    const expected = { id: 'user-2', balance: 100 } as any;
    service.adjustBalance.mockResolvedValue(expected);
    await expect(controller.adjustBalance('user-2', dto)).resolves.toBe(expected);
    expect(service.adjustBalance).toHaveBeenCalledWith('user-2', dto.amount);
  });

  it('removeMe', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const expected = { ok: true } as any;
    service.delete.mockResolvedValue(expected);
    await expect(controller.removeMe(req)).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith('user-1');
  });
});

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let service: any;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      listAdmins: jest.fn(),
      findById: jest.fn(),
      promoteToAdmin: jest.fn(),
      demoteToUser: jest.fn(),
      delete: jest.fn(),
    };
    controller = new AdminUsersController(service);
  });

  it('createAdmin', async () => {
    const dto = { username: 'admin', email: 'admin@ex.com', password: 'Secret123' } as any;
    const expected = { id: 'admin' } as any;
    service.create.mockResolvedValue(expected);
    await expect(controller.createAdmin(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ role: UserRole.ADMIN }));
  });

  it('listAdmins', async () => {
    const expected = [{ id: 'admin' }] as any;
    service.listAdmins.mockResolvedValue(expected);
    await expect(controller.listAdmins()).resolves.toBe(expected);
    expect(service.listAdmins).toHaveBeenCalled();
  });

  it('getAdmin', async () => {
    const expected = { id: 'admin' } as any;
    service.findById.mockResolvedValue(expected);
    await expect(controller.getAdmin('admin')).resolves.toBe(expected);
    expect(service.findById).toHaveBeenCalledWith('admin');
  });

  it('promote', async () => {
    const expected = { id: 'user-1', role: 'ADMIN' } as any;
    service.promoteToAdmin.mockResolvedValue(expected);
    await expect(controller.promote('user-1')).resolves.toBe(expected);
    expect(service.promoteToAdmin).toHaveBeenCalledWith('user-1');
  });

  it('demote', async () => {
    const expected = { id: 'user-1', role: 'USER' } as any;
    service.demoteToUser.mockResolvedValue(expected);
    await expect(controller.demote('user-1')).resolves.toBe(expected);
    expect(service.demoteToUser).toHaveBeenCalledWith('user-1');
  });

  it('delete', async () => {
    const expected = { ok: true } as any;
    service.delete.mockResolvedValue(expected);
    await expect(controller.delete('user-1')).resolves.toBe(expected);
    expect(service.delete).toHaveBeenCalledWith('user-1');
  });
});

describe('FlightsController', () => {
  let controller: FlightsController;
  let service: any;

  beforeEach(() => {
    service = {
      search: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      seatMap: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      cancel: jest.fn(),
    };
    controller = new FlightsController(service);
  });

  it('search', async () => {
    const dto = { from: 'TAS', to: 'LHR', date: '2025-10-12' } as any;
    const expected = [] as any;
    service.search.mockResolvedValue(expected);
    await expect(controller.search(dto)).resolves.toBe(expected);
    expect(service.search).toHaveBeenCalledWith(dto);
  });

  it('list', async () => {
    const expected = { total: 0 } as any;
    service.findAll.mockResolvedValue(expected);
    await expect(controller.list(2, 5)).resolves.toBe(expected);
    expect(service.findAll).toHaveBeenCalledWith(2, 5);
  });

  it('get', async () => {
    const expected = { id: 'flight-1' } as any;
    service.findOne.mockResolvedValue(expected);
    await expect(controller.get('flight-1')).resolves.toBe(expected);
    expect(service.findOne).toHaveBeenCalledWith('flight-1');
  });

  it('seatMap', async () => {
    const expected = { seats: [] } as any;
    service.seatMap.mockResolvedValue(expected);
    await expect(controller.seatMap('flight-1', 'BUSINESS')).resolves.toBe(expected);
    expect(service.seatMap).toHaveBeenCalledWith('flight-1', 'BUSINESS');
  });

  it('create', async () => {
    const dto = { flightNumber: 'AW-204' } as any;
    const expected = { id: 'flight-1' } as any;
    service.create.mockResolvedValue(expected);
    await expect(controller.create(dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update', async () => {
    const dto = { flightNumber: 'AW-204' } as any;
    const expected = { id: 'flight-1' } as any;
    service.update.mockResolvedValue(expected);
    await expect(controller.update('flight-1', dto)).resolves.toBe(expected);
    expect(service.update).toHaveBeenCalledWith('flight-1', dto);
  });

  it('remove', async () => {
    const expected = { id: 'flight-1' } as any;
    service.remove.mockResolvedValue(expected);
    await expect(controller.remove('flight-1')).resolves.toBe(expected);
    expect(service.remove).toHaveBeenCalledWith('flight-1');
  });

  it('cancel', async () => {
    const dto = { reason: 'Weather' } as any;
    const expected = { id: 'flight-1', status: 'CANCELLED' } as any;
    service.cancel.mockResolvedValue(expected);
    await expect(controller.cancel('flight-1', dto)).resolves.toBe(expected);
    expect(service.cancel).toHaveBeenCalledWith('flight-1', dto.reason);
  });
});

describe('GlobalSearchController', () => {
  it('run', async () => {
    const flightsService: any = { search: jest.fn().mockResolvedValue(['f']) };
    const controller = new GlobalSearchController(flightsService);
    const dto = { from: 'TAS', to: 'LHR', date: '2025-10-12' } as any;
    await expect(controller.run(dto)).resolves.toEqual(['f']);
    expect(flightsService.search).toHaveBeenCalledWith(dto);
  });
});

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: any;

  beforeEach(() => {
    service = {
      listAll: jest.fn(),
      myBookings: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      cancel: jest.fn(),
      seatMap: jest.fn(),
      assignSeat: jest.fn(),
      changeSeat: jest.fn(),
      updateByAdmin: jest.fn(),
      removeByAdmin: jest.fn(),
    };
    controller = new BookingsController(service);
  });

  it('list all bookings (admin)', async () => {
    const expected = { total: 0 } as any;
    service.listAll.mockResolvedValue(expected);
    await expect(controller.listAll(1, 20)).resolves.toBe(expected);
    expect(service.listAll).toHaveBeenCalledWith(1, 20);
  });

  it('my bookings', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const expected = { total: 0 } as any;
    service.myBookings.mockResolvedValue(expected);
    await expect(controller.my(req, 1, 10)).resolves.toBe(expected);
    expect(service.myBookings).toHaveBeenCalledWith('user-1', 1, 10);
  });

  it('create booking', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const dto = { flightId: 'flight-1' } as any;
    const expected = { id: 'booking-1' } as any;
    service.create.mockResolvedValue(expected);
    await expect(controller.create(req, dto)).resolves.toBe(expected);
    expect(service.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('cancel booking', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const dto = { reason: 'Change' } as any;
    const expected = { refundRate: 1 } as any;
    service.cancel.mockResolvedValue(expected);
    await expect(controller.cancel(req, 'booking-1', dto)).resolves.toBe(expected);
    expect(service.cancel).toHaveBeenCalledWith('user-1', 'booking-1', dto.reason);
  });

  it('seat map', async () => {
    const expected = { seats: [] } as any;
    service.seatMap.mockResolvedValue(expected);
    await expect(controller.seatMap('flight-1')).resolves.toBe(expected);
    expect(service.seatMap).toHaveBeenCalledWith('flight-1');
  });

  it('assign seat', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const dto = { seatId: 'seat-1' } as any;
    const expected = { id: 'booking-1' } as any;
    service.assignSeat.mockResolvedValue(expected);
    await expect(controller.assignSeat(req, 'booking-1', dto)).resolves.toBe(expected);
    expect(service.assignSeat).toHaveBeenCalledWith('user-1', 'booking-1', dto);
  });

  it('change seat', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const dto = { newSeatId: 'seat-2' } as any;
    const expected = { id: 'booking-1' } as any;
    service.changeSeat.mockResolvedValue(expected);
    await expect(controller.changeSeat(req, 'booking-1', dto)).resolves.toBe(expected);
    expect(service.changeSeat).toHaveBeenCalledWith('user-1', 'booking-1', dto);
  });

  it('get booking by id (admin)', async () => {
    const booking = { id: 'booking-1' } as any;
    service.findById.mockResolvedValue(booking);
    await expect(controller.getById('booking-1')).resolves.toBe(booking);
    expect(service.findById).toHaveBeenCalledWith('booking-1');
  });

  it('update booking by admin', async () => {
    const updated = { id: 'booking-1', paymentStatus: 'PAID' } as any;
    service.updateByAdmin.mockResolvedValue(updated);
    await expect(controller.updateByAdmin('booking-1', { paymentStatus: 'PAID' } as any)).resolves.toBe(updated);
    expect(service.updateByAdmin).toHaveBeenCalledWith('booking-1', { paymentStatus: 'PAID' });
  });

  it('remove booking by admin', async () => {
    const expected = { id: 'booking-1' } as any;
    service.removeByAdmin.mockResolvedValue(expected);
    await expect(controller.removeByAdmin('booking-1')).resolves.toBe(expected);
    expect(service.removeByAdmin).toHaveBeenCalledWith('booking-1');
  });
});

describe('Companies controllers', () => {
  let companiesController: CompaniesController;
  let planesController: PlanesController;
  let seatsController: SeatsController;
  let service: any;

  beforeEach(() => {
    service = {
      findCompanies: jest.fn(),
      findCompanyById: jest.fn(),
      createCompany: jest.fn(),
      updateCompany: jest.fn(),
      removeCompany: jest.fn(),
      findPlanes: jest.fn(),
      findPlaneById: jest.fn(),
      createPlane: jest.fn(),
      updatePlane: jest.fn(),
      removePlane: jest.fn(),
      findSeats: jest.fn(),
      findSeatById: jest.fn(),
      createSeat: jest.fn(),
      updateSeat: jest.fn(),
      removeSeat: jest.fn(),
      listAllPlanes: jest.fn(),
      getPlane: jest.fn(),
      createPlaneGlobal: jest.fn(),
      updatePlaneGlobal: jest.fn(),
      removePlaneGlobal: jest.fn(),
      listSeatsGlobal: jest.fn(),
      getSeat: jest.fn(),
      createSeatGlobal: jest.fn(),
      updateSeatGlobal: jest.fn(),
      removeSeatGlobal: jest.fn(),
    };
    companiesController = new CompaniesController(service);
    planesController = new PlanesController(service);
    seatsController = new SeatsController(service);
  });

  it('list companies', async () => {
    const expected = [] as any;
    service.findCompanies.mockResolvedValue(expected);
    await expect(companiesController.findCompanies()).resolves.toBe(expected);
    expect(service.findCompanies).toHaveBeenCalled();
  });

  it('company CRUD', async () => {
    const company = { id: 'comp-1' } as any;
    service.findCompanyById.mockResolvedValue(company);
    await expect(companiesController.findCompany('comp-1')).resolves.toBe(company);
    expect(service.findCompanyById).toHaveBeenCalledWith('comp-1');

    const createDto = { name: 'Comp' } as any;
    service.createCompany.mockResolvedValue(company);
    await expect(companiesController.createCompany(createDto)).resolves.toBe(company);
    expect(service.createCompany).toHaveBeenCalledWith(createDto);

    const updateDto = { name: 'Comp 2' } as any;
    service.updateCompany.mockResolvedValue(company);
    await expect(companiesController.updateCompany('comp-1', updateDto)).resolves.toBe(company);
    expect(service.updateCompany).toHaveBeenCalledWith('comp-1', updateDto);

    service.removeCompany.mockResolvedValue({ id: 'comp-1' } as any);
    await expect(companiesController.removeCompany('comp-1')).resolves.toEqual({ id: 'comp-1' });
    expect(service.removeCompany).toHaveBeenCalledWith('comp-1');
  });

  it('planes under company', async () => {
    const planes = [{ id: 'plane-1' }] as any;
    service.findPlanes.mockResolvedValue(planes);
    await expect(companiesController.findPlanes('comp-1')).resolves.toBe(planes);
    expect(service.findPlanes).toHaveBeenCalledWith('comp-1');

    const plane = { id: 'plane-1' } as any;
    service.findPlaneById.mockResolvedValue(plane);
    await expect(companiesController.findPlane('comp-1', 'plane-1')).resolves.toBe(plane);
    expect(service.findPlaneById).toHaveBeenCalledWith('comp-1', 'plane-1');

    const createDto = { model: 'A320' } as any;
    service.createPlane.mockResolvedValue(plane);
    await expect(companiesController.createPlane('comp-1', createDto)).resolves.toBe(plane);
    expect(service.createPlane).toHaveBeenCalledWith('comp-1', createDto);

    const updateDto = { model: 'A321' } as any;
    service.updatePlane.mockResolvedValue(plane);
    await expect(companiesController.updatePlane('comp-1', 'plane-1', updateDto)).resolves.toBe(plane);
    expect(service.updatePlane).toHaveBeenCalledWith('comp-1', 'plane-1', updateDto);

    service.removePlane.mockResolvedValue({ id: 'plane-1' } as any);
    await expect(companiesController.removePlane('comp-1', 'plane-1')).resolves.toEqual({ id: 'plane-1' });
    expect(service.removePlane).toHaveBeenCalledWith('comp-1', 'plane-1');
  });

  it('seats under company', async () => {
    const seats = [{ id: 'seat-1' }] as any;
    service.findSeats.mockResolvedValue(seats);
    await expect(companiesController.findSeats('comp-1', 'plane-1')).resolves.toBe(seats);
    expect(service.findSeats).toHaveBeenCalledWith('comp-1', 'plane-1');

    const seat = { id: 'seat-1' } as any;
    service.findSeatById.mockResolvedValue(seat);
    await expect(companiesController.findSeat('comp-1', 'plane-1', 'seat-1')).resolves.toBe(seat);
    expect(service.findSeatById).toHaveBeenCalledWith('comp-1', 'plane-1', 'seat-1');

    const createDto = { seatNumber: '12A' } as any;
    service.createSeat.mockResolvedValue(seat);
    await expect(companiesController.createSeat('comp-1', 'plane-1', createDto)).resolves.toBe(seat);
    expect(service.createSeat).toHaveBeenCalledWith('comp-1', 'plane-1', createDto);

    const updateDto = { seatNumber: '12B' } as any;
    service.updateSeat.mockResolvedValue(seat);
    await expect(companiesController.updateSeat('comp-1', 'plane-1', 'seat-1', updateDto)).resolves.toBe(seat);
    expect(service.updateSeat).toHaveBeenCalledWith('comp-1', 'plane-1', 'seat-1', updateDto);

    service.removeSeat.mockResolvedValue({ id: 'seat-1' } as any);
    await expect(companiesController.removeSeat('comp-1', 'plane-1', 'seat-1')).resolves.toEqual({ id: 'seat-1' });
    expect(service.removeSeat).toHaveBeenCalledWith('comp-1', 'plane-1', 'seat-1');
  });

  it('global planes controller', async () => {
    const listResult = [{ id: 'p' }] as any;
    service.listAllPlanes.mockResolvedValue([listResult, 1] as any);
    await expect(planesController.list(1, 2)).resolves.toEqual({ total: 1, page: 1, limit: 2, items: listResult });
    expect(service.listAllPlanes).toHaveBeenCalledWith(1, 2);

    const plane = { id: 'plane-1' } as any;
    service.getPlane.mockResolvedValue(plane);
    await expect(planesController.get('plane-1')).resolves.toBe(plane);
    expect(service.getPlane).toHaveBeenCalledWith('plane-1');

    const createPlaneDto = { model: 'A320', totalSeats: 180, companyId: 'comp-1' } as any;
    service.createPlaneGlobal.mockResolvedValue(plane);
    await expect(planesController.create(createPlaneDto)).resolves.toBe(plane);
    expect(service.createPlaneGlobal).toHaveBeenCalledWith(createPlaneDto);

    const updatePlaneDto = { model: 'A321' } as any;
    service.updatePlaneGlobal.mockResolvedValue(plane);
    await expect(planesController.update('plane-1', updatePlaneDto)).resolves.toBe(plane);
    expect(service.updatePlaneGlobal).toHaveBeenCalledWith('plane-1', updatePlaneDto);

    service.removePlaneGlobal.mockResolvedValue({ id: 'plane-1' } as any);
    await expect(planesController.remove('plane-1')).resolves.toEqual({ id: 'plane-1' });
    expect(service.removePlaneGlobal).toHaveBeenCalledWith('plane-1');
  });

  it('global seats controller', async () => {
    const items = [{ id: 's' }] as any;
    service.listSeatsGlobal.mockResolvedValue([items, 1] as any);
    await expect(seatsController.list(1, 10, 'plane')).resolves.toEqual({ total: 1, page: 1, limit: 10, items });
    expect(service.listSeatsGlobal).toHaveBeenCalledWith(1, 10, 'plane');

    const seat = { id: 'seat-1' } as any;
    service.getSeat.mockResolvedValue(seat);
    await expect(seatsController.get('seat-1')).resolves.toBe(seat);
    expect(service.getSeat).toHaveBeenCalledWith('seat-1');

    const createSeatDto = { seatNumber: '12A', travelClassId: 'class-1', planeId: 'plane-1' } as any;
    service.createSeatGlobal.mockResolvedValue(seat);
    await expect(seatsController.create(createSeatDto)).resolves.toBe(seat);
    expect(service.createSeatGlobal).toHaveBeenCalledWith(createSeatDto);

    const updateSeatDto = { seatNumber: '12B', planeId: 'plane-1' } as any;
    service.updateSeatGlobal.mockResolvedValue(seat);
    await expect(seatsController.update('seat-1', updateSeatDto)).resolves.toBe(seat);
    expect(service.updateSeatGlobal).toHaveBeenCalledWith('seat-1', updateSeatDto);

    service.removeSeatGlobal.mockResolvedValue({ id: 'seat-1' } as any);
    await expect(seatsController.remove('seat-1')).resolves.toEqual({ id: 'seat-1' });
    expect(service.removeSeatGlobal).toHaveBeenCalledWith('seat-1');
  });
});

describe('Locations controllers', () => {
  let service: any;
  let countries: CountriesController;
  let cities: CitiesController;
  let airports: AirportsController;

  beforeEach(() => {
    service = {
      listCountries: jest.fn(),
      getCountry: jest.fn(),
      createCountry: jest.fn(),
      updateCountry: jest.fn(),
      removeCountry: jest.fn(),
      listCities: jest.fn(),
      getCity: jest.fn(),
      createCity: jest.fn(),
      updateCity: jest.fn(),
      removeCity: jest.fn(),
      listAirports: jest.fn(),
      getAirport: jest.fn(),
      createAirport: jest.fn(),
      updateAirport: jest.fn(),
      removeAirport: jest.fn(),
    };
    countries = new CountriesController(service);
    cities = new CitiesController(service);
    airports = new AirportsController(service);
  });

  it('countries CRUD', async () => {
    service.listCountries.mockResolvedValue([[{ id: 'c' }], 1] as any);
    await expect(countries.list(1, 10)).resolves.toEqual({ total: 1, page: 1, limit: 10, items: [{ id: 'c' }] });
    expect(service.listCountries).toHaveBeenCalledWith(1, 10);

    const country = { id: 'c' } as any;
    service.getCountry.mockResolvedValue(country);
    await expect(countries.get('c')).resolves.toBe(country);

    const createCountryDto = { name: 'Uzbekistan', code: 'UZB' } as any;
    service.createCountry.mockResolvedValue(country);
    await expect(countries.create(createCountryDto)).resolves.toBe(country);
    expect(service.createCountry).toHaveBeenCalledWith(createCountryDto);

    const updateCountryDto = { name: 'Uzbekistan' } as any;
    service.updateCountry.mockResolvedValue(country);
    await expect(countries.update('c', updateCountryDto)).resolves.toBe(country);
    expect(service.updateCountry).toHaveBeenCalledWith('c', updateCountryDto);

    service.removeCountry.mockResolvedValue({ id: 'c' } as any);
    await expect(countries.remove('c')).resolves.toEqual({ id: 'c' });
    expect(service.removeCountry).toHaveBeenCalledWith('c');
  });

  it('cities CRUD', async () => {
    const countryId = '123e4567-e89b-12d3-a456-426614174000';
    service.listCities.mockResolvedValue([[{ id: 'city' }], 1] as any);
    await expect(cities.list(1, 10, countryId)).resolves.toEqual({ total: 1, page: 1, limit: 10, items: [{ id: 'city' }] });
    expect(service.listCities).toHaveBeenCalledWith(1, 10, countryId);

    const city = { id: 'city' } as any;
    service.getCity.mockResolvedValue(city);
    await expect(cities.get('city')).resolves.toBe(city);

    const createCityDto = { name: 'Tashkent', countryId: 'country' } as any;
    service.createCity.mockResolvedValue(city);
    await expect(cities.create(createCityDto)).resolves.toBe(city);
    expect(service.createCity).toHaveBeenCalledWith(createCityDto);

    const updateCityDto = { name: 'Samarqand' } as any;
    service.updateCity.mockResolvedValue(city);
    await expect(cities.update('city', updateCityDto)).resolves.toBe(city);
    expect(service.updateCity).toHaveBeenCalledWith('city', updateCityDto);

    service.removeCity.mockResolvedValue({ id: 'city' } as any);
    await expect(cities.remove('city')).resolves.toEqual({ id: 'city' });
    expect(service.removeCity).toHaveBeenCalledWith('city');
  });

  it('airports CRUD', async () => {
    const cityId = '123e4567-e89b-42d3-a456-426614174001';
    service.listAirports.mockResolvedValue([[{ id: 'airport' }], 1] as any);
    await expect(airports.list(1, 10, cityId)).resolves.toEqual({ total: 1, page: 1, limit: 10, items: [{ id: 'airport' }] });
    expect(service.listAirports).toHaveBeenCalledWith(1, 10, cityId);

    const airport = { id: 'airport' } as any;
    service.getAirport.mockResolvedValue(airport);
    await expect(airports.get('airport')).resolves.toBe(airport);

    const createAirportDto = { name: 'JFK', cityId: 'city', code: 'JFK' } as any;
    service.createAirport.mockResolvedValue(airport);
    await expect(airports.create(createAirportDto)).resolves.toBe(airport);
    expect(service.createAirport).toHaveBeenCalledWith(createAirportDto);

    const updateAirportDto = { name: 'JFK' } as any;
    service.updateAirport.mockResolvedValue(airport);
    await expect(airports.update('airport', updateAirportDto)).resolves.toBe(airport);
    expect(service.updateAirport).toHaveBeenCalledWith('airport', updateAirportDto);

    service.removeAirport.mockResolvedValue({ id: 'airport' } as any);
    await expect(airports.remove('airport')).resolves.toEqual({ id: 'airport' });
    expect(service.removeAirport).toHaveBeenCalledWith('airport');
  });
});

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: any;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new ClassesController(service);
  });

  it('should handle CRUD', async () => {
    service.findAll.mockResolvedValue([{ id: 'class' }] as any);
    await expect(controller.findAll()).resolves.toEqual([{ id: 'class' }]);

    const klass = { id: 'class' } as any;
    service.findOne.mockResolvedValue(klass);
    await expect(controller.findOne('class')).resolves.toBe(klass);

    service.create.mockResolvedValue(klass);
    await expect(controller.create({ name: 'BUSINESS', multiplier: 1.5 } as any)).resolves.toBe(klass);

    service.update.mockResolvedValue(klass);
    await expect(controller.update('class', { multiplier: 1.7 } as any)).resolves.toBe(klass);

    service.remove.mockResolvedValue({ id: 'class' } as any);
    await expect(controller.remove('class')).resolves.toEqual({ id: 'class' });
  });
});

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: any;

  beforeEach(() => {
    service = {
      post: jest.fn(),
      listAll: jest.fn(),
      listForFlight: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new ReviewsController(service);
  });

  it('create review', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const dto = { flightId: 'flight-1', rating: 5 } as any;
    service.post.mockResolvedValue({ id: 'review' } as any);
    await expect(controller.create(req, dto)).resolves.toEqual({ id: 'review' });
    expect(service.post).toHaveBeenCalledWith('user-1', dto.flightId, dto.rating, dto.comment);
  });

  it('list all reviews', async () => {
    service.listAll.mockResolvedValue({ total: 0 } as any);
    await expect(controller.listAll(1, 10)).resolves.toEqual({ total: 0 });
  });

  it('get review by id', async () => {
    const review = { id: 'review' } as any;
    service.getById.mockResolvedValue(review);
    await expect(controller.getById('review')).resolves.toBe(review);
    expect(service.getById).toHaveBeenCalledWith('review');
  });

  it('list by flight', async () => {
    service.listForFlight.mockResolvedValue({ total: 0 } as any);
    await expect(controller.listByFlight('flight-1', 1, 10)).resolves.toEqual({ total: 0 });
    expect(service.listForFlight).toHaveBeenCalledWith('flight-1', 1, 10);
  });

  it('update review', async () => {
    const req = { user: { sub: 'user-1', role: 'USER' } } as any;
    const dto = { comment: 'Updated' } as any;
    const result = { id: 'review', comment: 'Updated' } as any;
    service.update.mockResolvedValue(result);
    await expect(controller.update(req, 'review', dto)).resolves.toBe(result);
    expect(service.update).toHaveBeenCalledWith('review', 'user-1', dto, 'USER');
  });

  it('remove review', async () => {
    const req = { user: { sub: 'admin', role: 'ADMIN' } } as any;
    service.remove.mockResolvedValue({ id: 'review' } as any);
    await expect(controller.remove(req, 'review')).resolves.toEqual({ id: 'review' });
    expect(service.remove).toHaveBeenCalledWith('review', 'admin', true);
  });
});

describe('NewsController', () => {
  let controller: NewsController;
  let service: any;

  beforeEach(() => {
    service = {
      list: jest.fn(),
      getBySlug: jest.fn(),
      listAdmin: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new NewsController(service);
  });

  it('list news', async () => {
    service.list.mockResolvedValue({ total: 0 } as any);
    await expect(controller.list()).resolves.toEqual({ total: 0 });
  });

  it('get by slug', async () => {
    const news = { id: 'news', slug: 'slug' } as any;
    service.getBySlug.mockResolvedValue(news);
    await expect(controller.get('slug')).resolves.toBe(news);
  });

  it('list admin', async () => {
    const expected = { total: 0 } as any;
    service.listAdmin.mockResolvedValue(expected);
    await expect(controller.listAdmin()).resolves.toBe(expected);
  });

  it('get admin by id', async () => {
    const news = { id: 'news' } as any;
    service.getById.mockResolvedValue(news);
    await expect(controller.getAdmin('news')).resolves.toBe(news);
    expect(service.getById).toHaveBeenCalledWith('news');
  });

  it('create/update/remove', async () => {
    const req = { user: { sub: 'admin' } } as any;
    const dto = { title: 'News' } as any;
    const news = { id: 'news' } as any;
    service.create.mockResolvedValue(news);
    await expect(controller.create(req, dto)).resolves.toBe(news);
    expect(service.create).toHaveBeenCalledWith('admin', dto);

    service.update.mockResolvedValue(news);
    await expect(controller.update('news', dto)).resolves.toBe(news);

    service.remove.mockResolvedValue({ id: 'news' } as any);
    await expect(controller.remove('news')).resolves.toEqual({ id: 'news' });
  });
});

describe('LoyaltyController', () => {
  let controller: LoyaltyController;
  let service: any;

  beforeEach(() => {
    service = {
      get: jest.fn(),
      redeemPoints: jest.fn(),
      earnPoints: jest.fn(),
      list: jest.fn(),
      getTransaction: jest.fn(),
      createManual: jest.fn(),
      updateTransaction: jest.fn(),
      removeTransaction: jest.fn(),
    };
    controller = new LoyaltyController(service);
  });

  it('get loyalty info', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const expected = { points: 0 } as any;
    service.get.mockResolvedValue(expected);
    await expect(controller.me(req)).resolves.toBe(expected);
    expect(service.get).toHaveBeenCalledWith('user-1');
  });

  it('redeem points', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const expected = { ok: true } as any;
    service.redeemPoints.mockResolvedValue(expected);
    await expect(controller.redeem(req, 50)).resolves.toBe(expected);
    expect(service.redeemPoints).toHaveBeenCalledWith('user-1', 50);
  });

  it('list transactions (admin)', async () => {
    service.list.mockResolvedValue({ total: 0 } as any);
    await expect(controller.list(1, 20, '123e4567-e89b-12d3-a456-426614174000')).resolves.toEqual({ total: 0 });
    expect(service.list).toHaveBeenCalledWith(1, 20, '123e4567-e89b-12d3-a456-426614174000');
  });

  it('get transaction', async () => {
    const txn = { id: 'txn-1' } as any;
    service.getTransaction.mockResolvedValue(txn);
    await expect(controller.getTransaction('txn-1')).resolves.toBe(txn);
    expect(service.getTransaction).toHaveBeenCalledWith('txn-1');
  });

  it('create manual transaction', async () => {
    const dto = { userId: 'user', type: 'EARN', points: 100 } as any;
    const txn = { id: 'txn-1' } as any;
    service.createManual.mockResolvedValue(txn);
    await expect(controller.createTransaction(dto)).resolves.toBe(txn);
    expect(service.createManual).toHaveBeenCalledWith(dto);
  });

  it('update transaction', async () => {
    const txn = { id: 'txn-1', reason: 'Updated' } as any;
    service.updateTransaction.mockResolvedValue(txn);
    await expect(controller.updateTransaction('txn-1', { reason: 'Updated' })).resolves.toBe(txn);
    expect(service.updateTransaction).toHaveBeenCalledWith('txn-1', 'Updated');
  });

  it('remove transaction', async () => {
    const res = { id: 'txn-1' } as any;
    service.removeTransaction.mockResolvedValue(res);
    await expect(controller.removeTransaction('txn-1')).resolves.toBe(res);
    expect(service.removeTransaction).toHaveBeenCalledWith('txn-1');
  });
});

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: any;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      listMine: jest.fn(),
      listAll: jest.fn(),
      findById: jest.fn(),
      remove: jest.fn(),
    };
    controller = new TicketsController(service);
  });

  it('create ticket', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const dto = { bookingId: 'booking-1' } as any;
    const ticket = { id: 'ticket-1' } as any;
    service.create.mockResolvedValue(ticket);
    await expect(controller.create(req, dto)).resolves.toBe(ticket);
    expect(service.create).toHaveBeenCalledWith('user-1', dto.bookingId);
  });

  it('list mine', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    service.listMine.mockResolvedValue({ total: 0 } as any);
    await expect(controller.mine(req, 1, 10)).resolves.toEqual({ total: 0 });
    expect(service.listMine).toHaveBeenCalledWith('user-1', 1, 10);
  });

  it('list all (admin)', async () => {
    service.listAll.mockResolvedValue({ total: 0 } as any);
    await expect(controller.listAll(1, 20)).resolves.toEqual({ total: 0 });
    expect(service.listAll).toHaveBeenCalledWith(1, 20);
  });

  it('get ticket by id', async () => {
    const ticket = { id: 'ticket-1' } as any;
    service.findById.mockResolvedValue(ticket);
    await expect(controller.getById('ticket-1')).resolves.toBe(ticket);
    expect(service.findById).toHaveBeenCalledWith('ticket-1');
  });

  it('remove ticket', async () => {
    service.remove.mockResolvedValue({ id: 'ticket-1' } as any);
    await expect(controller.remove('ticket-1')).resolves.toEqual({ id: 'ticket-1' });
    expect(service.remove).toHaveBeenCalledWith('ticket-1');
  });
});
