import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsUUID, IsOptional } from 'class-validator';

export class CreateTripDto {
  @ApiProperty({
    example: 'São Paulo, SP',
    description: 'Origem da viagem',
  })
  @IsString({ message: 'Origem deve ser uma string' })
  @IsNotEmpty({ message: 'Origem é obrigatória' })
  origin: string;

  @ApiProperty({
    example: 'Rio de Janeiro, RJ',
    description: 'Destino da viagem',
  })
  @IsString({ message: 'Destino deve ser uma string' })
  @IsNotEmpty({ message: 'Destino é obrigatório' })
  destination: string;

  @ApiProperty({
    example: '2025-02-15T08:00:00.000Z',
    description: 'Data e hora de início da viagem',
  })
  @IsDateString({}, { message: 'Data de início deve estar em formato ISO válido' })
  startDate: string;

  @ApiProperty({
    example: '2025-02-17T18:00:00.000Z',
    description: 'Data e hora de fim da viagem',
  })
  @IsDateString({}, { message: 'Data de fim deve estar em formato ISO válido' })
  endDate: string;

  @ApiProperty({
    example: 'Reunião com cliente importante para apresentação de proposta',
    description: 'Motivo/propósito da viagem',
  })
  @IsString({ message: 'Propósito deve ser uma string' })
  @IsNotEmpty({ message: 'Propósito é obrigatório' })
  purpose: string;

  @ApiProperty({
    description: 'ID do centro de custo responsável',
  })
  @IsUUID(4, { message: 'ID do centro de custo deve ser um UUID válido' })
  @IsNotEmpty({ message: 'Centro de custo é obrigatório' })
  costCenterId: string;

  @ApiPropertyOptional({
    description: 'ID do projeto relacionado (opcional)',
  })
  @IsOptional()
  @IsUUID(4, { message: 'ID do projeto deve ser um UUID válido' })
  projectId?: string;

  @ApiPropertyOptional({
    example: 'Viagem aprovada pelo diretor. Orçamento estimado: R$ 2.500',
    description: 'Observações sobre a viagem',
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  notes?: string;
}