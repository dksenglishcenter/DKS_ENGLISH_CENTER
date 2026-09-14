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
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireFeature } from '../common/feature.decorator';
import { FeatureGuard } from '../common/feature.guard';
import {
  CreateStudentDto,
  LinkParentDto,
  ListStudentsQueryDto,
  StudentParamsDto,
  StudentParentParamsDto,
  UpdateStudentDto,
} from './dto/student.dto';
import { StudentsService } from './students.service';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard)
@RequireFeature('PHASE3')
@Roles(Role.ADMIN)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  list(@Query() query: ListStudentsQueryDto) {
    return this.studentsService.list(query);
  }

  @Get(':id')
  findOne(@Param() params: StudentParamsDto) {
    return this.studentsService.findOne(params.id);
  }

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  update(@Param() params: StudentParamsDto, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(params.id, dto);
  }

  @Delete(':id')
  remove(@Param() params: StudentParamsDto) {
    return this.studentsService.remove(params.id);
  }

  @Post(':id/parents')
  async linkParent(
    @Param() params: StudentParamsDto,
    @Body() dto: LinkParentDto,
  ) {
    const result = await this.studentsService.linkParent(
      params.id,
      dto.parentUserId,
    );
    return { message: 'Đã gắn phụ huynh với học viên.', ...result };
  }

  @Delete(':id/parents/:parentUserId')
  unlinkParent(@Param() params: StudentParentParamsDto) {
    return this.studentsService.unlinkParent(params.id, params.parentUserId);
  }
}
