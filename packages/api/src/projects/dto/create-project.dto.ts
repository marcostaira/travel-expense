import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Expansão Regional Sul',
    description: 'Nome do projeto',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: 'EXP-REG-SUL',
    description: 'Código do projeto',
  })
  @IsString({ message: 'Código deve ser uma string' })
  @IsNotEmpty({ message: 'Código é obrigatório' })
  code: string;

  @ApiPropertyOptional({
    description: 'ID do centro de custo responsável',
  })
  @IsOptional()
  @IsUUID(4, { message: 'ID do centro de custo deve ser um UUID válido' })
  costCenterId?: string;
}