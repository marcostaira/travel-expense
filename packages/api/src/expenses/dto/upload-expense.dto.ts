import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadExpenseFileDto {
  @ApiPropertyOptional({
    example: 'Recibo do almoço',
    description: 'Descrição do arquivo',
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;
}
```# SaaS de Gestão de Despesas de Viagem

## Estrutura do Projeto