import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, IsUUID, IsOptional, Min, IsInt } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    example: 2025,
    description: 'Ano do orçamento',
  })
  @IsInt({ message: 'Ano deve ser um número inteiro' })
  @Min(2020, { message: 'Ano deve ser maior ou igual a 2020' })
  year: number;

  @ApiProperty({
    example: 'YEARLY',
    description: 'Período do orçamento',
    enum: ['YEARLY', 'QUARTERLY', 'MONTHLY'],
  })
  @IsEnum(['YEARLY', 'QUARTERLY', 'MONTHLY'], {
    message: 'Período deve ser YEARLY, QUARTERLY ou MONTHLY',
  })
  period: 'YEARLY' | 'QUARTERLY' | 'MONTHLY';

  @ApiProperty({
    description: 'ID do centro de custo',
  })
  @IsUUID(4, { message: 'ID do centro de custo deve ser um UUID válido' })
  @IsNotEmpty({ message: 'Centro de custo é obrigatório' })
  costCenterId: string;

  @ApiPropertyOptional({
    description: 'ID do projeto (opcional)',
  })
  @IsOptional()
  @IsUUID(4, { message: 'ID do projeto deve ser um UUID válido' })
  projectId?: string;

  @ApiProperty({
    example: 50000.00,
    description: 'Valor do orçamento',
  })
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  amount: number;
}