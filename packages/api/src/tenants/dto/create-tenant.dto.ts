import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, IsOptional, IsObject } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    example: 'Empresa Demo Ltda',
    description: 'Nome da empresa',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: '12.345.678/0001-90',
    description: 'CNPJ da empresa',
  })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
  })
  cnpj: string;

  @ApiPropertyOptional({
    description: 'Configurações do tenant',
    example: {
      currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      approvalLevels: 2,
      maxFileSize: 10485760,
    },
  })
  @IsOptional()
  @IsObject({ message: 'Settings deve ser um objeto' })
  settings?: {
    currency?: string;
    timezone?: string;
    approvalLevels?: number;
    maxFileSize?: number;
    [key: string]: any;
  };
}