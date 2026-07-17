import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequestUser } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
  UserParamsDto,
} from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query() query: ListUsersQueryDto) {
    return this.usersService.list(query);
  }

  @Get(':id')
  findOne(@Param() params: UserParamsDto) {
    return this.usersService.findOne(params.id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(
    @Param() params: UserParamsDto,
    @CurrentUser() actor: AuthRequestUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(params.id, actor.id, dto);
  }

  @Delete(':id')
  remove(
    @Param() params: UserParamsDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    return this.usersService.remove(params.id, actor.id);
  }
}
