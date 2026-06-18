import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.NORMAL_USER)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  submit(@Body() dto: CreateRatingDto, @CurrentUser() user: any) {
    return this.ratingsService.upsert(user.userId, dto);
  }
}
