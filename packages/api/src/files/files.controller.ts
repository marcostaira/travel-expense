import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { FilesService } from './files.service';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

class UploadFileDto {
  description?: string;
}

@ApiTags('Arquivos')
@ApiBearerAuth('jwt')
@Controller('files')
@UseGuards(RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload de arquivo genérico' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo da despesa (recibo, nota fiscal, etc.)',
        },
        description: {
          type: 'string',
          description: 'Descrição do arquivo',
          example: 'Recibo do almoço',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Arquivo da despesa enviado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        filename: { type: 'string' },
        url: { type: 'string' },
        mime: { type: 'string' },
        size: { type: 'number' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async uploadExpenseFile(
    @CurrentUser() user: CurrentUserData,
    @Param('expenseId') expenseId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string,
  ) {
    return this.filesService.uploadExpenseFile(
      user.tenantId, 
      expenseId, 
      file, 
      description
    );
  }

  @Get('expenses/:expenseId')
  @ApiOperation({ summary: 'Listar arquivos de uma despesa' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de arquivos da despesa retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          filename: { type: 'string' },
          url: { type: 'string' },
          mime: { type: 'string' },
          size: { type: 'number' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getExpenseFiles(
    @CurrentUser() user: CurrentUserData,
    @Param('expenseId') expenseId: string,
  ) {
    return this.filesService.getExpenseFiles(user.tenantId, expenseId);
  }

  @Delete('expenses/:expenseId/files/:fileId')
  @ApiOperation({ summary: 'Excluir arquivo de despesa' })
  @ApiResponse({ 
    status: 200, 
    description: 'Arquivo excluído com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async deleteExpenseFile(
    @CurrentUser() user: CurrentUserData,
    @Param('expenseId') expenseId: string,
    @Param('fileId') fileId: string,
  ) {
    return this.filesService.deleteExpenseFile(user.tenantId, expenseId, fileId);
  }

  @Post('ocr')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Extrair dados de recibo via OCR (mock)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagem do recibo para OCR',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados extraídos do recibo com sucesso',
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 45.90 },
        date: { type: 'string', example: '2025-01-15' },
        vendor: { type: 'string', example: 'Restaurante do João' },
        cnpj: { type: 'string', example: '12.345.678/0001-90' },
      },
    },
  })
  async performOCR(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.filesService.performOCR(file);
  }
}'binary',
          description: 'Arquivo para upload',
        },
        folder: {
          type: 'string',
          description: 'Pasta de destino',
          example: 'documents',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Arquivo enviado com sucesso',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        storageKey: { type: 'string' },
        mime: { type: 'string' },
        size: { type: 'number' },
      },
    },
  })
  async uploadFile(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder = 'documents',
  ) {
    return this.filesService.uploadFile(file, folder, user.tenantId);
  }

  @Post('expenses/:expenseId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload de arquivo para despesa' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: