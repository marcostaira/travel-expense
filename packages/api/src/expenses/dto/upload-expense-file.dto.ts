import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UploadExpenseFileDto {
  @ApiPropertyOptional({
    example: "Recibo do almoço executivo",
    description: "Descrição do arquivo anexado",
  })
  @IsOptional()
  @IsString({ message: "Descrição deve ser uma string" })
  description?: string;
}
