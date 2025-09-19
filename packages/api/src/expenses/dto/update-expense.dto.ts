import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsUUID,
  Min,
} from "class-validator";

export class UpdateExpenseDto {
  @ApiPropertyOptional({
    description: "ID da viagem",
  })
  @IsOptional()
  @IsUUID(4, { message: "ID da viagem deve ser um UUID válido" })
  tripId?: string;

  @ApiPropertyOptional({
    example: "FOOD",
    description: "Categoria da despesa",
    enum: [
      "FOOD",
      "ACCOMMODATION",
      "TRANSPORT",
      "TOLL",
      "PARKING",
      "FUEL",
      "OTHER",
    ],
  })
  @IsOptional()
  @IsEnum(
    ["FOOD", "ACCOMMODATION", "TRANSPORT", "TOLL", "PARKING", "FUEL", "OTHER"],
    {
      message: "Categoria deve ser uma das opções válidas",
    }
  )
  category?:
    | "FOOD"
    | "ACCOMMODATION"
    | "TRANSPORT"
    | "TOLL"
    | "PARKING"
    | "FUEL"
    | "OTHER";

  @ApiPropertyOptional({
    example: "2025-01-15T12:00:00.000Z",
    description: "Data da despesa",
  })
  @IsOptional()
  @IsDateString({}, { message: "Data deve estar em formato ISO válido" })
  date?: string;

  @ApiPropertyOptional({
    example: "USD",
    description: "Moeda da despesa",
  })
  @IsOptional()
  @IsString({ message: "Moeda deve ser uma string" })
  currency?: string;

  @ApiPropertyOptional({
    example: 125.5,
    description: "Valor da despesa",
  })
  @IsOptional()
  @IsNumber({}, { message: "Valor deve ser um número" })
  @Min(0.01, { message: "Valor deve ser maior que zero" })
  amount?: number;

  @ApiPropertyOptional({
    example: true,
    description: "Se possui recibo",
  })
  @IsOptional()
  @IsBoolean({ message: "Has receipt deve ser um boolean" })
  hasReceipt?: boolean;

  @ApiPropertyOptional({
    example: "Hotel Exemplo",
    description: "Fornecedor/Estabelecimento",
  })
  @IsOptional()
  @IsString({ message: "Vendor deve ser uma string" })
  vendor?: string;

  @ApiPropertyOptional({
    example: "Hospedagem durante viagem de negócios",
    description: "Observações sobre a despesa",
  })
  @IsOptional()
  @IsString({ message: "Notes deve ser uma string" })
  notes?: string;

  @ApiPropertyOptional({
    description: "ID do centro de custo",
  })
  @IsOptional()
  @IsUUID(4, { message: "ID do centro de custo deve ser um UUID válido" })
  costCenterId?: string;

  @ApiPropertyOptional({
    description: "ID do projeto",
  })
  @IsOptional()
  @IsUUID(4, { message: "ID do projeto deve ser um UUID válido" })
  projectId?: string;

  @ApiPropertyOptional({
    example: 200.0,
    description: "Quilômetros rodados",
  })
  @IsOptional()
  @IsNumber({}, { message: "KM rodado deve ser um número" })
  @Min(0, { message: "KM rodado deve ser maior ou igual a zero" })
  kmDriven?: number;
}
