import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequestUser } from '../auth/guards/jwt-auth.guard';
import { SaveAnswersDto } from './dto/save-answers.dto';
import { MockTestService } from './mock-test.service';

/** Student-facing exam flow. Every route requires a logged-in user. */
@Controller('mock-tests')
@UseGuards(JwtAuthGuard)
export class MockTestController {
  constructor(private readonly service: MockTestService) {}

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
  async start(@Param('id') id: string, @CurrentUser() user: AuthRequestUser) {
    const attempt = await this.service.startAttempt(id, user.id);
    return { attempt };
  }

  @Patch('attempts/:attemptId/answers')
  async save(
    @Param('attemptId') attemptId: string,
    @Body() dto: SaveAnswersDto,
    @CurrentUser() user: AuthRequestUser,
  ) {
    return this.service.saveAnswers(attemptId, user.id, dto.answers);
  }

  @Post('attempts/:attemptId/submit')
  async submit(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: AuthRequestUser,
  ) {
    const result = await this.service.submit(attemptId, user.id);
    return { result };
  }

  @Get('attempts/:attemptId/result')
  async result(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: AuthRequestUser,
  ) {
    const result = await this.service.getResult(attemptId, user.id);
    return { result };
  }
}
