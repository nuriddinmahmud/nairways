import { PartialType } from '@nestjs/swagger';
import { CreatePlaneDto } from './create-plane.dto';

export class UpdatePlaneDto extends PartialType(CreatePlaneDto) {}
