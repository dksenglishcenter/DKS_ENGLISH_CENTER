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
import { ClassesService } from './classes.service';
import {
  ClassParamsDto,
  ClassStudentParamsDto,
  CreateClassDto,
  EnrollStudentDto,
  ListClassesQueryDto,
  UpdateClassDto,
} from './dto/class.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @Roles(Role.ADMIN)
  list(@Query() query: ListClassesQueryDto) {
    return this.classesService.list(query);
  }

  @Get('mine')
  @Roles(Role.TEACHER, Role.ADMIN)
  listMine(@CurrentUser() actor: AuthRequestUser) {
    return this.classesService.listMine(actor.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  findOne(
    @Param() params: ClassParamsDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    return this.classesService.findOne(params.id, actor);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param() params: ClassParamsDto, @Body() dto: UpdateClassDto) {
    return this.classesService.update(params.id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param() params: ClassParamsDto) {
    return this.classesService.remove(params.id);
  }

  @Post(':id/students')
  @Roles(Role.ADMIN)
  enroll(@Param() params: ClassParamsDto, @Body() dto: EnrollStudentDto) {
    return this.classesService.enroll(params.id, dto.studentId);
  }

  @Delete(':id/students/:studentId')
  @Roles(Role.ADMIN)
  unenroll(@Param() params: ClassStudentParamsDto) {
    return this.classesService.unenroll(params.id, params.studentId);
  }
}
