import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { Airport } from './entities/airport.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Country) private readonly countries: Repository<Country>,
    @InjectRepository(City) private readonly cities: Repository<City>,
    @InjectRepository(Airport) private readonly airports: Repository<Airport>,
  ) {}

  async listCountries(page = 1, limit = 50) {
    return this.countries.findAndCount({
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getCountry(id: string) {
    const country = await this.countries.findOne({ where: { id } });
    if (!country) throw new NotFoundException('Country not found');
    return country;
  }

  createCountry(dto: CreateCountryDto) {
    const entity = this.countries.create(dto);
    return this.countries.save(entity);
  }

  async updateCountry(id: string, dto: UpdateCountryDto) {
    const entity = await this.countries.preload({ id, ...dto });
    if (!entity) throw new NotFoundException('Country not found');
    return this.countries.save(entity);
  }

  async removeCountry(id: string) {
    const country = await this.getCountry(id);
    await this.countries.remove(country);
    return { id };
  }

  async listCities(page = 1, limit = 50, countryId?: string) {
    const options: FindManyOptions<City> = {
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { country: true },
    };
    if (countryId) {
      options.where = { country: { id: countryId } };
    }
    return this.cities.findAndCount(options);
  }

  async getCity(id: string) {
    const city = await this.cities.findOne({ where: { id }, relations: { country: true } });
    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  async createCity(dto: CreateCityDto) {
    const country = await this.getCountry(dto.countryId);
    const city = this.cities.create({ name: dto.name, country });
    return this.cities.save(city);
  }

  async updateCity(id: string, dto: UpdateCityDto) {
    const city = await this.getCity(id);
    if (dto.name !== undefined) {
      city.name = dto.name;
    }
    if (dto.countryId) {
      city.country = await this.getCountry(dto.countryId);
    }
    return this.cities.save(city);
  }

  async removeCity(id: string) {
    const city = await this.getCity(id);
    await this.cities.remove(city);
    return { id };
  }

  async listAirports(page = 1, limit = 50, cityId?: string) {
    const options: FindManyOptions<Airport> = {
      order: { code: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { city: { country: true } },
    };
    if (cityId) {
      options.where = { city: { id: cityId } };
    }
    return this.airports.findAndCount(options);
  }

  async getAirport(id: string) {
    const airport = await this.airports.findOne({
      where: { id },
      relations: { city: { country: true } },
    });
    if (!airport) throw new NotFoundException('Airport not found');
    return airport;
  }

  async createAirport(dto: CreateAirportDto) {
    const city = await this.getCity(dto.cityId);
    const airport = this.airports.create({
      name: dto.name,
      code: dto.code,
      city,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
    return this.airports.save(airport);
  }

  async updateAirport(id: string, dto: UpdateAirportDto) {
    const airport = await this.getAirport(id);
    if (dto.name !== undefined) airport.name = dto.name;
    if (dto.code !== undefined) airport.code = dto.code;
    if (dto.latitude !== undefined) airport.latitude = dto.latitude;
    if (dto.longitude !== undefined) airport.longitude = dto.longitude;
    if (dto.cityId) {
      airport.city = await this.getCity(dto.cityId);
    }
    return this.airports.save(airport);
  }

  async removeAirport(id: string) {
    const airport = await this.getAirport(id);
    await this.airports.remove(airport);
    return { id };
  }
}
