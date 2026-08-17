import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ImportTestDto } from './dto/import-test.dto';
import { SaveAnswersDto } from './dto/save-answers.dto';
import { SetPublishedDto } from './dto/set-published.dto';
import { MockTestService } from './mock-test.service';

/**
 * Public routes let anyone take a test (no login). The /admin routes are for
 * authoring and require an ADMIN or TEACHER account.
 */
@Controller('mock-tests')
export class MockTestController {
  constructor(private readonly service: MockTestService) {}

  // ── Authoring (teacher / admin) ─────────────────────────────────────

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async listAll() {
    const tests = await this.service.listAllForAdmin();
    return { tests };
  }

  @Post('admin/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async import(@Body() dto: ImportTestDto) {
    const test = await this.service.importTest(dto);
    return { message: 'Đã tạo đề thi.', test };
  }

  @Patch('admin/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async setPublished(
    @Param('id') id: string,
    @Body() dto: SetPublishedDto,
  ) {
    const test = await this.service.setPublished(id, dto.isPublished);
    return { test };
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ── Public exam flow (no login) ─────────────────────────────────────

  @Get()
  async list() {
    const tests = await this.service.listTests();
    return { tests };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const test = await this.service.getTestForTaking(id);
    return { test };
  }

  @Post(':id/attempts')
  @HttpCode(HttpStatus.CREATED)
  async start(@Param('id') id: string) {
    const attempt = await this.service.startAttempt(id, null);
    return { attempt };
  }

  @Patch('attempts/:attemptId/answers')
  async save(
    @Param('attemptId') attemptId: string,
    @Body() dto: SaveAnswersDto,
  ) {
    return this.service.saveAnswers(attemptId, null, dto.answers);
  }

  @Post('attempts/:attemptId/submit')
  async submit(@Param('attemptId') attemptId: string) {
    const result = await this.service.submit(attemptId, null);
    return { result };
  }

  @Get('attempts/:attemptId/state')
  async state(@Param('attemptId') attemptId: string) {
    return this.service.getAttemptState(attemptId);
  }

  @Get('attempts/:attemptId/result')
  async result(@Param('attemptId') attemptId: string) {
    const result = await this.service.getResult(attemptId, null);
    return { result };
  }
}
