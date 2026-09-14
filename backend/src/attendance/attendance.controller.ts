import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequestUser } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireFeature } from '../common/feature.decorator';
import { FeatureGuard } from '../common/feature.guard';
import { ClassParamsDto } from '../classes/dto/class.dto';
import { StudentParamsDto } from '../students/dto/student.dto';
import { AttendanceService } from './attendance.service';
import {
  AttendanceRangeQueryDto,
  OpenSessionDto,
  SaveAttendanceDto,
  SessionParamsDto,
} from './dto/attendance.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard)
@RequireFeature('PHASE3')
@Roles(Role.ADMIN, Role.TEACHER)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('classes/:id/sessions')
  openSession(
    @Param() params: ClassParamsDto,
    @Body() dto: OpenSessionDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    return this.attendanceService.openSession(params.id, dto, actor);
  }

  @Put('sessions/:id/attendance')
  saveAttendance(
    @Param() params: SessionParamsDto,
    @Body() dto: SaveAttendanceDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    return this.attendanceService.saveAttendance(params.id, dto, actor);
  }

  @Get('classes/:id/attendance')
  historyByClass(
    @Param() params: ClassParamsDto,
    @Query() query: AttendanceRangeQueryDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    return this.attendanceService.historyByClass(params.id, query, actor);
  }

  @Get('students/:id/attendance')
  historyByStudent(
    @Param() params: StudentParamsDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    return this.attendanceService.historyByStudent(params.id, actor);
  }
}
