import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString, Min } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty({
    example: 'FOOD',
    description: 'Categoria da política',
    enum: ['FOOD', 'ACCOMMODATION', 'TRANSPORT', 'TOLL', 'PARKING', 'FUEL', 'OTHER'],
  })
  @IsEnum(['FOOD', 'ACCOMMODATION', 'TRANSPORT', 'TOLL', 'PARKING', 'FUEL', 'OTHER'])
  category: 'FOOD' | 'ACCOMMODATION' | 'TRANSPORT' | 'TOLL' | 'PARKING' | 'FUEL' | 'OTHER';

  @ApiPropertyOptional({
    example: 50.00,
    description: 'Valor acima do qual o recibo é obrigatório',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  receiptRequiredOver?: number;

  @ApiPropertyOptional({
    example: 120.00,
    description: 'Valor da diária permitida',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  perDiemAmount?: number;

  @ApiPropertyOptional({
    example: 1.20,
    description: 'Valor por quilômetro rodado',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  kmRate?: number;

  @ApiPropertyOptional({
    example: 300.00,
    description: 'Limite diário para a categoria',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0, { message: 'Valor deve ser maior ou igual a zero' })
  dailyLimit?: number;

  @ApiPropertyOptional({
    example: 'Política para alimentação durante viagens',
    description: 'Observações sobre a política',
  })
  @IsOptional()
  @IsString({ message: 'Notes deve ser uma string' })
  notes?: string;
}