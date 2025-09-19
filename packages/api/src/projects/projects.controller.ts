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

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Projetos')
@ApiBearerAuth('jwt')
@Controller('projects')
@UseGuards(RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Criar projeto' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso' })
  create(@CurrentUser() user: CurrentUserData, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(user.tenantId, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar projetos' })
  @ApiResponse({ status: 200, description: 'Lista de projetos retornada com sucesso' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.projectsService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar projeto por ID' })
  @ApiResponse({ status: 200, description: 'Projeto encontrado' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.projectsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Atualizar projeto' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado com sucesso' })
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user.tenantId, id, updateProjectDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Remover projeto' })
  @ApiResponse({ status: 200, description: 'Projeto removido com sucesso' })
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.projectsService.remove(user.tenantId, id);
  }
}