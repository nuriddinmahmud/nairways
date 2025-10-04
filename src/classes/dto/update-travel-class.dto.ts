import { PartialType } from '@nestjs/swagger';
import { CreateTravelClassDto } from './create-travel-class.dto';

export class UpdateTravelClassDto extends PartialType(CreateTravelClassDto) {}
