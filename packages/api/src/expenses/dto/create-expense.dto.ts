import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiPropertyOptional({
    description: 'ID da viagem (opcional)',
  })
  @IsOptional()
  @IsUUID(4, { message: 'ID da viagem deve ser um UUID válido' })
  tripId?: string;

  @ApiProperty({
    example: 'FOOD',
    description: 'Categoria da despesa',
    enum: ['FOOD', 'ACCOMMODATION', 'TRANSPORT', 'TOLL', 'PARKING', 'FUEL', 'OTHER'],
  })
  @IsEnum(['FOOD', 'ACCOMMODATION', 'TRANSPORT', 'TOLL', 'PARKING', 'FUEL', 'OTHER'], {
    message: 'Categoria deve ser uma das opções válidas',
  })
  category: 'FOOD' | 'ACCOMMODATION' | 'TRANSPORT' | 'TOLL' | 'PARKING' | 'FUEL' | 'OTHER';

  @ApiProperty({
    example: '2025-01-15T12:00:00.000Z',
    description: 'Data da despesa',
  })
  @IsDateString({}, { message: 'Data deve estar em formato ISO válido' })
  date: string;

  @ApiProperty({
    example: 'BRL',
    description: 'Moeda da despesa',
    default: 'BRL',
  })
  @IsString({ message: 'Moeda deve ser uma string' })
  @IsNotEmpty({ message: 'Moeda é obrigatória' })
  currency: string = 'BRL';

  @ApiProperty({
    example: 89.90,
    description: 'Valor da despesa',
  })
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @Min(0.01, { message: 'Valor deve ser maior que zero' })
  amount: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Se possui recibo',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Has receipt deve ser um boolean' })
  hasReceipt?: boolean = false;

  @ApiPropertyOptional({
    example: 'Restaurante Exemplo',
    description: 'Fornecedor/Estabelecimento',
  })
  @IsOptional()
  @IsString({ message: 'Vendor deve ser uma string' })
  vendor?: string;

  @ApiPropertyOptional({
    example: 'Almoço de negócios com cliente',
    description: 'Observações sobre a despesa',
  })
  @IsOptional()
  @IsString({ message: 'Notes deve ser uma string' })
  notes?: string;

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

  @ApiPropertyOptional({
    example: 150.5,
    description: 'Quilômetros rodados (para categoria TRANSPORT)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'KM rodado deve ser um número' })
  @Min(0, { message: 'KM rodado deve ser maior ou igual a zero' })
  kmDriven?: number;
}