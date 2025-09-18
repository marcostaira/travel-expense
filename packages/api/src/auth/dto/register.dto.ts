import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: 'joao@empresa.com',
    description: 'Email do usuário',
  })
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    example: 'MinhaEmpresa@123',
    description: 'Senha (mín. 8 caracteres, 1 maiúscula, 1 número)',
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número',
  })
  password: string;

  @ApiProperty({
    example: 'Minha Empresa Ltda',
    description: 'Nome da empresa',
  })
  @IsString({ message: 'Nome da empresa deve ser uma string' })
  @IsNotEmpty({ message: 'Nome da empresa é obrigatório' })
  companyName: string;

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
}