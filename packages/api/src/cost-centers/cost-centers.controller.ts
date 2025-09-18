import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Centros de Custo')
@ApiBearerAuth('jwt')
@Controller('cost-centers')
@UseGuards(RolesGuard)
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar centro de custo' })
  @ApiResponse({ status: 201, description: 'Centro de custo criado com sucesso' })
  create(@CurrentUser() user: CurrentUserData, @Body() createCostCenterDto: CreateCostCenterDto) {
    return this.costCentersService.create(user.tenantId, createCostCenterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar centros de custo' })
  @ApiResponse({ status: 200, description: 'Lista de centros de custo retornada com sucesso' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.costCentersService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar centro de custo por ID' })
  @ApiResponse({ status: 200, description: 'Centro de custo encontrado' })
  @ApiResponse({ status: 404, description: 'Centro de custo não encontrado' })
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.costCentersService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar centro de custo' })
  @ApiResponse({ status: 200, description: 'Centro de custo atualizado com sucesso' })
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() updateCostCenterDto: UpdateCostCenterDto,
  ) {
    return this.costCentersService.update(user.tenantId, id, updateCostCenterDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover centro de custo' })
  @ApiResponse({ status: 200, description: 'Centro de custo removido com sucesso' })
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.costCentersService.remove(user.tenantId, id);
  }
}