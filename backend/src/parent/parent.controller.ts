import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthRequestUser } from '../auth/guards/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StudentParamsDto } from '../students/dto/student.dto';
import { InvoiceParamsDto } from '../tuition/dto/tuition.dto';
import { ParentService } from './parent.service';

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
  reportTransfer(
    @Param() params: InvoiceParamsDto,
    @CurrentUser() actor: AuthRequestUser,
  ) {
    return this.parentService.reportTransfer(actor.id, params.id);
  }
}
