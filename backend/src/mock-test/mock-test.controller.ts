import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthRequestUser } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GradeSpeakingDto, GradeWritingDto } from './dto/grade.dto';
import { ImportTestDto } from './dto/import-test.dto';
import { SaveAnswersDto } from './dto/save-answers.dto';
import { SetAudioDto } from './dto/set-audio.dto';
import { SetPublishedDto } from './dto/set-published.dto';
import { SubmitWritingDto } from './dto/submit-writing.dto';
import { MockTestService } from './mock-test.service';

const MAX_AUDIO_SIZE = 30 * 1024 * 1024;

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

  @Patch('admin/:id/audio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async setAudio(@Param('id') id: string, @Body() dto: SetAudioDto) {
    const test = await this.service.setAudio(id, dto.audioUrl ?? null);
    return { test };
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ── Grading queue (teacher / admin) ─────────────────────────────────

  @Get('admin/submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async pending() {
    return this.service.listPendingSubmissions();
  }

  @Get('admin/submissions/writing/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async writing(@Param('id') id: string) {
    const submission = await this.service.getWritingSubmission(id);
    return { submission };
  }

  @Get('admin/submissions/speaking/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async speaking(@Param('id') id: string) {
    const submission = await this.service.getSpeakingSubmission(id);
    return { submission };
  }

  @Patch('admin/submissions/writing/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async gradeWriting(
    @Param('id') id: string,
    @Body() dto: GradeWritingDto,
    @CurrentUser() user: AuthRequestUser,
  ) {
    const submission = await this.service.gradeWriting(id, dto, user.id);
    return { submission };
  }

  @Patch('admin/submissions/speaking/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEACHER)
  async gradeSpeaking(
    @Param('id') id: string,
    @Body() dto: GradeSpeakingDto,
    @CurrentUser() user: AuthRequestUser,
  ) {
    const submission = await this.service.gradeSpeaking(id, dto, user.id);
    return { submission };
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

  @Post('attempts/:attemptId/submit-writing')
  async submitWriting(
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitWritingDto,
  ) {
    const result = await this.service.submitWriting(
      attemptId,
      null,
      dto.responseText,
    );
    return { result };
  }

  @Post('attempts/:attemptId/submit-speaking')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_AUDIO_SIZE },
    }),
  )
  async submitSpeaking(
    @Param('attemptId') attemptId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Thiếu file ghi âm (field: file).');
    }
    const result = await this.service.submitSpeaking(attemptId, null, file);
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
