import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Orçamentos')
@ApiBearerAuth('jwt')
@Controller('budgets')
@UseGuards(RolesGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Criar orçamento' })
  @ApiResponse({ status: 201, description: 'Orçamento criado com sucesso' })
  create(@CurrentUser() user: CurrentUserData, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(user.tenantId, createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar orçamentos' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'period', required: false, enum: ['YEARLY', 'QUARTERLY', 'MONTHLY'] })
  @ApiQuery({ name: 'costCenterId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de orçamentos retornada com sucesso' })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('year') year?: number,
    @Query('period') period?: string,
    @Query('costCenterId') costCenterId?: string,
  ) {
    const filters = {
      year: year || new Date().getFullYear(),
      period: period as any,
      costCenterId,
    };
    return this.budgetsService.findAll(user.tenantId, filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo de orçamentos vs gastos' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Resumo de orçamentos retornado com sucesso' })
  getSummary(
    @CurrentUser() user: CurrentUserData,
    @Query('year') year?: number,
  ) {
    return this.budgetsService.getBudgetSummary(user.tenantId, year || new Date().getFullYear());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar orçamento por ID' })
  @ApiResponse({ status: 200, description: 'Orçamento encontrado' })
  @ApiResponse({ status: 404, description: 'Orçamento não encontrado' })
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.budgetsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Atualizar orçamento' })
  @ApiResponse({ status: 200, description: 'Orçamento atualizado com sucesso' })
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(user.tenantId, id, updateBudgetDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover orçamento' })
  @ApiResponse({ status: 200, description: 'Orçamento removido com sucesso' })
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.budgetsService.remove(user.tenantId, id);
  }
}