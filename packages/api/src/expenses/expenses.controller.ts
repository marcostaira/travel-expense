import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';

import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UploadExpenseFileDto } from './dto/upload-expense-file.dto';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Despesas')
@ApiBearerAuth('jwt')
@Controller('expenses')
@UseGuards(RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova despesa' })
  @ApiResponse({ status: 201, description: 'Despesa criada com sucesso' })
  create(@CurrentUser() user: CurrentUserData, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(user.tenantId, user.userId, createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar despesas' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de despesas retornada com sucesso' })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('tripId') tripId?: string,
  ) {
    const filters = {
      status,
      category,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      tripId,
    };

    return this.expensesService.findAll(
      user.tenantId,
      user.userId,
      user.role,
      page,
      limit,
      filters,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar despesa por ID' })
  @ApiResponse({ status: 200, description: 'Despesa encontrada' })
  @ApiResponse({ status: 404, description: 'Despesa não encontrada' })
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.expensesService.findOne(user.tenantId, id, user.userId, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar despesa' })
  @ApiResponse({ status: 200, description: 'Despesa atualizada com sucesso' })
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(user.tenantId, id, user.userId, user.role, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir despesa' })
  @ApiResponse({ status: 200, description: 'Despesa excluída com sucesso' })
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.expensesService.remove(user.tenantId, id, user.userId, user.role);
  }

  @Post(':id/files')
  @ApiOperation({ summary: 'Upload de arquivo para despesa' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))

  
  uploadFile(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() uploadDto: UploadExpenseFileDto,
    @UploadedFile() file: Express.Multer.File,
    ) {
    return this.expensesService.uploadFile(user.tenantId, id, user.userId, user.role, uploadDto, file);
    }
    @Delete(':id/files/:fileId')
    @ApiOperation({ summary: 'Excluir arquivo da despesa' })
    @ApiResponse({ status: 200, description: 'Arquivo excluído com sucesso' })
    deleteFile(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    ) {
    return this.expensesService.deleteFile(user.tenantId, id, fileId, user.userId, user.role);
    }
    @Post(':id/submit')
    @ApiOperation({ summary: 'Enviar despesa para aprovação' })
    @ApiResponse({ status: 200, description: 'Despesa enviada com sucesso' })
    submit(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.expensesService.submit(user.tenantId, id, user.userId, user.role);
    }
    @Post(':id/approve')
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Aprovar despesa' })
    @ApiResponse({ status: 200, description: 'Despesa aprovada com sucesso' })
    approve(@CurrentUser() user: CurrentUserData, @Param('id') id: string, @Body('notes') notes?: string) {
    return this.expensesService.approve(user.tenantId, id, user.userId, notes);
    }
    @Post(':id/reject')
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Rejeitar despesa' })
    @ApiResponse({ status: 200, description: 'Despesa rejeitada com sucesso' })
    reject(@CurrentUser() user: CurrentUserData, @Param('id') id: string, @Body('reason') reason: string) {
    return this.expensesService.reject(user.tenantId, id, user.userId, reason);
    }
    @Post(':id/adjust')
    @Roles('ADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Ajustar valor da despesa' })
    @ApiResponse({ status: 200, description: 'Despesa ajustada com sucesso' })
    adjust(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body('adjustedAmount') adjustedAmount: number,
    @Body('reason') reason: string,
    ) {
    return this.expensesService.adjust(user.tenantId, id, user.userId, adjustedAmount, reason);
    }
}