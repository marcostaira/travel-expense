import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCostCenterDto {
  @ApiProperty({
    example: "Tecnologia da Informação",
    description: "Nome do centro de custo",
  })
  @IsString({ message: "Nome deve ser uma string" })
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name: string;

  @ApiProperty({
    example: "TI-001",
    description: "Código único do centro de custo",
  })
  @IsString({ message: "Código deve ser uma string" })
  @IsNotEmpty({ message: "Código é obrigatório" })
  code: string;
}
