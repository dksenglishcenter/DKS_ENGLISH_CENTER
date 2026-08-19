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
  CreateInvoiceDto,
  InvoiceParamsDto,
  ListInvoicesQueryDto,
  UpdateInvoiceDto,
} from './dto/tuition.dto';
import { TuitionService } from './tuition.service';

@Controller('tuition')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard)
@RequireFeature('PHASE3')
@Roles(Role.ADMIN)
export class TuitionController {
  constructor(private readonly tuitionService: TuitionService) {}

  @Get()
  list(@Query() query: ListInvoicesQueryDto) {
    return this.tuitionService.list(query);
  }

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.tuitionService.create(dto);
  }

  @Patch(':id')
  update(@Param() params: InvoiceParamsDto, @Body() dto: UpdateInvoiceDto) {
    return this.tuitionService.update(params.id, dto);
  }

  @Delete(':id')
  remove(@Param() params: InvoiceParamsDto) {
    return this.tuitionService.remove(params.id);
  }

  @Post(':id/mark-paid')
  markPaid(@Param() params: InvoiceParamsDto) {
    return this.tuitionService.markPaid(params.id);
  }
}
