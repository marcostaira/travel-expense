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

import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  CurrentUser,
  CurrentUserData,
} from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@ApiTags("Usuários")
@ApiBearerAuth("jwt")
@Controller("users")
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles("ADMIN")
  @ApiOperation({ summary: "Criar novo usuário" })
  @ApiResponse({ status: 201, description: "Usuário criado com sucesso" })
  @ApiResponse({ status: 400, description: "Dados inválidos" })
  @ApiResponse({ status: 403, description: "Acesso negado" })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createUserDto: CreateUserDto
  ) {
    return this.usersService.create(user.tenantId, createUserDto);
  }

  @Get()
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Listar usuários do tenant" })
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
  @ApiResponse({
    status: 200,
    description: "Lista de usuários retornada com sucesso",
  })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number
  ) {
    return this.usersService.findAll(user.tenantId, page, limit);
  }

  @Get("me")
  @ApiOperation({ summary: "Dados do usuário logado" })
  @ApiResponse({
    status: 200,
    description: "Dados do usuário retornados com sucesso",
  })
  getMe(@CurrentUser() user: CurrentUserData) {
    return this.usersService.findOne(user.tenantId, user.userId);
  }

  @Get("me/tenants")
  @ApiOperation({ summary: "Listar tenants do usuário logado" })
  @ApiResponse({
    status: 200,
    description: "Lista de tenants do usuário",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          cnpj: { type: "string" },
          role: { type: "string" },
          active: { type: "boolean" },
        },
      },
    },
  })
  getMyTenants(@CurrentUser() user: CurrentUserData) {
    return this.usersService.getUserTenants(user.userId);
  }

  @Get(":id")
  @Roles("ADMIN", "MANAGER")
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiResponse({ status: 200, description: "Usuário encontrado" })
  @ApiResponse({ status: 404, description: "Usuário não encontrado" })
  findOne(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    return this.usersService.findOne(user.tenantId, id);
  }

  @Patch("me")
  @ApiOperation({ summary: "Atualizar dados do usuário logado" })
  @ApiResponse({ status: 200, description: "Dados atualizados com sucesso" })
  updateMe(
    @CurrentUser() user: CurrentUserData,
    @Body() updateUserDto: UpdateUserDto
  ) {
    // Remove role from update when updating self
    const { role, ...selfUpdateDto } = updateUserDto;
    return this.usersService.update(user.tenantId, user.userId, selfUpdateDto);
  }

  @Patch(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Atualizar usuário" })
  @ApiResponse({ status: 200, description: "Usuário atualizado com sucesso" })
  update(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(user.tenantId, id, updateUserDto);
  }

  @Delete(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Remover usuário do tenant" })
  @ApiResponse({ status: 200, description: "Usuário removido com sucesso" })
  remove(@CurrentUser() user: CurrentUserData, @Param("id") id: string) {
    return this.usersService.remove(user.tenantId, id);
  }
}
