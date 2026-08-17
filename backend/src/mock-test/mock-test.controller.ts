import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SaveAnswersDto } from './dto/save-answers.dto';
import { MockTestService } from './mock-test.service';

/**
 * Public exam flow — taking a mock test needs no login. An attempt is
 * anonymous and is reached only via its unguessable id.
 */
@Controller('mock-tests')
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

  @Get('attempts/:attemptId/result')
  async result(@Param('attemptId') attemptId: string) {
    const result = await this.service.getResult(attemptId, null);
    return { result };
  }
}
