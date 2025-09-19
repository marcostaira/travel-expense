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

import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Tenants')
@ApiBearerAuth('jwt')
@Controller('tenants')
@UseGuards(RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar tenant' })
  @ApiResponse({ status: 201, description: 'Tenant criado com sucesso' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos os tenants' })
  @ApiResponse({ status: 200, description: 'Lista de tenants retornada com sucesso' })
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get('current')
  @ApiOperation({ summary: 'Obter tenant atual do usuário' })
  @ApiResponse({ status: 200, description: 'Tenant atual retornado com sucesso' })
  getCurrent(@CurrentUser() user: CurrentUserData) {
    return this.tenantsService.findOne(user.tenantId);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Buscar tenant por ID' })
  @ApiResponse({ status: 200, description: 'Tenant encontrado' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar tenant' })
  @ApiResponse({ status: 200, description: 'Tenant atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desativar tenant' })
  @ApiResponse({ status: 200, description: 'Tenant desativado com sucesso' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}