import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";

import { TripsService } from "./trips.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";
import {
  CurrentUser,
  CurrentUserData,
} from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@ApiTags("Viagens")
@ApiBearerAuth("jwt")
@Controller("trips")
@UseGuards(RolesGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: "Criar viagem" })
  @ApiResponse({ status: 201, description: "Viagem criada com sucesso" })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createTripDto: CreateTripDto
  ) {
    return this.tripsService.create(user.tenantId, user.userId, createTripDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar viagens" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Página (padrão: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Itens por página (padrão: 20)",
  })
  @ApiQuery({
    name: "status",
    required: false,
    type: String,
    description: "Filtrar por status",
  })
  @ApiQuery({
    name: "managerId",
    required: false,
    type: String,
    description: "Filtrar por gestor",
  })
  @ApiQuery({
    name: "costCenterId",
    required: false,
    type: String,
    description: "Filtrar por centro de custo",
  })
  @ApiQuery({
    name: "dateFrom",
    required: false,
    type: String,
    description: "Data inicial (YYYY-MM-DD)",
  })
  @ApiQuery({
    name: "dateTo",
    required: false,
    type: String,
    description: "Data final (YYYY-MM-DD)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de viagens retornada com sucesso",
  })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("status") status?: string,
    @Query("managerId") managerId?: string,
    @Query("costCenterId") costCenterId?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string
  ) {
    const filters = {
      status,
      managerId,
      costCenterId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    return this.tripsService.findAll(
      user.tenantId,
      user.userId,
      user.role,
      page,
      limit,
      filters
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar viagem por ID" })
  @ApiResponse({ status: 200, description: "Viagem encontrada" })
  @ApiResponse({ status: 404, description: "Viagem não encontrada" })
  findOne(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    return this.tripsService.findOne(user.tenantId, id, user.userId, user.role);
  }

  @Get(":id/summary")
  @ApiOperation({ summary: "Resumo financeiro da viagem" })
  @ApiResponse({
    status: 200,
    description: "Resumo da viagem retornado com sucesso",
  })
  getTripSummary(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string
  ) {
    return this.tripsService.getTripSummary(
      user.tenantId,
      id,
      user.userId,
      user.role
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar viagem" })
  @ApiResponse({ status: 200, description: "Viagem atualizada com sucesso" })
  update(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
    @Body() updateTripDto: UpdateTripDto
  ) {
    return this.tripsService.update(
      user.tenantId,
      id,
      user.userId,
      user.role,
      updateTripDto
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Excluir viagem" })
  @ApiResponse({ status: 200, description: "Viagem excluída com sucesso" })
  remove(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    return this.tripsService.remove(user.tenantId, id, user.userId, user.role);
  }

  @Post(":id/submit")
  @ApiOperation({ summary: "Enviar viagem para aprovação" })
  @ApiResponse({ status: 200, description: "Viagem enviada com sucesso" })
  submit(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    return this.tripsService.submit(user.tenantId, id, user.userId, user.role);
  }

  @Post(":id/approve")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Aprovar viagem" })
  @ApiResponse({ status: 200, description: "Viagem aprovada com sucesso" })
  approve(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
    @Body("notes") notes?: string
  ) {
    return this.tripsService.approve(
      user.tenantId,
      id,
      user.userId,
      user.role,
      notes
    );
  }

  @Post(":id/reject")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Rejeitar viagem" })
  @ApiResponse({ status: 200, description: "Viagem rejeitada com sucesso" })
  reject(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
    @Body("notes") notes: string
  ) {
    return this.tripsService.reject(
      user.tenantId,
      id,
      user.userId,
      user.role,
      notes
    );
  }

  @Post(":id/start")
  @ApiOperation({ summary: "Iniciar viagem" })
  @ApiResponse({ status: 200, description: "Viagem iniciada com sucesso" })
  start(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    return this.tripsService.start(user.tenantId, id, user.userId, user.role);
  }

  @Post(":id/complete")
  @ApiOperation({ summary: "Finalizar viagem" })
  @ApiResponse({ status: 200, description: "Viagem finalizada com sucesso" })
  complete(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    return this.tripsService.complete(
      user.tenantId,
      id,
      user.userId,
      user.role
    );
  }

  @Post(":id/archive")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Arquivar viagem" })
  @ApiResponse({ status: 200, description: "Viagem arquivada com sucesso" })
  archive(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    return this.tripsService.archive(user.tenantId, id, user.userId, user.role);
  }
}
