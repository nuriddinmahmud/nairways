import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ example: 'SaudiAir launches new Jeddah to Riyadh route' })
  @IsString()
  title!: string;

  @ApiProperty({
    example:
      'Starting November 10, passengers can enjoy multiple daily flights between Jeddah and Riyadh with our modern Boeing 787 Dreamliner fleet.',
  })
  @IsString()
  content!: string;

  @ApiProperty({
    required: false,
    example: 'https://cdn.saudi-airways.com/news/jeddah-riyadh.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
