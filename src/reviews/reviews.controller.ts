import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UserRole } from '../common/constants';
import { UpdateReviewDto } from './dto/update-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    return this.service.post(req.user.sub, dto.flightId, dto.rating, dto.comment);
  }

  @Get()
  listAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.listAll(Number(page), Number(limit));
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get('flight/:id')
  listByFlight(@Param('id') id: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.listForFlight(id, Number(page), Number(limit));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.service.update(id, req.user.sub, dto, req.user.role as UserRole);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role as UserRole);
    return this.service.remove(id, req.user.sub, isAdmin);
  }
}
