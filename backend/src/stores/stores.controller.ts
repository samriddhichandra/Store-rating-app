import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { QueryStoreDto } from './dto/query-store.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }

  // Available to every logged-in role: admin browses all stores, normal
  // users browse + see their own submitted rating per store.
  @Get()
  findAll(@Query() query: QueryStoreDto, @CurrentUser() user: any) {
    const currentUserId = user?.role === Role.NORMAL_USER ? user.userId : undefined;
    return this.storesService.findAll(query, currentUserId);
  }

  @Get('owner/dashboard')
  @UseGuards(RolesGuard)
  @Roles(Role.STORE_OWNER)
  getOwnerDashboard(@CurrentUser() user: any) {
    return this.storesService.getOwnerDashboard(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }
}
