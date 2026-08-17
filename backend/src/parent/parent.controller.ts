import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequestUser } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StudentParamsDto } from '../students/dto/student.dto';
import { InvoiceParamsDto } from '../tuition/dto/tuition.dto';
import { ReportTransferDto } from './dto/report-transfer.dto';
import { ParentService } from './parent.service';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('children')
  listChildren(@CurrentUser() actor: AuthRequestUser) {
    return this.parentService.listChildren(actor.id);
  }

  @Get('children/:id/attendance')
  childAttendance(
    @Param() params: StudentParamsDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    return this.parentService.childAttendance(actor.id, params.id);
  }

  @Get('invoices')
  listInvoices(@CurrentUser() actor: AuthRequestUser) {
    return this.parentService.listInvoices(actor.id);
  }

  @Get('reminders')
  reminders(@CurrentUser() actor: AuthRequestUser) {
    return this.parentService.reminders(actor.id);
  }

  @Post('invoices/:id/report-transfer')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  reportTransfer(
    @Param() params: InvoiceParamsDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: ReportTransferDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    if (!file && !dto.paymentProofUrl?.trim()) {
      throw new BadRequestException(
        'Vui lòng chọn ảnh minh chứng chuyển khoản.',
      );
    }

    return this.parentService.reportTransfer(actor.id, params.id, {
      file,
      paymentProofUrl: dto.paymentProofUrl,
    });
  }
}
