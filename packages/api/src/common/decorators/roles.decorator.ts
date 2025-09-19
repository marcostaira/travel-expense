import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

export type UserRole = "ADMIN" | "MANAGER" | "COLLABORATOR";

/**
 * Decorator to specify required roles for accessing a route
 * Usage: @Roles('ADMIN', 'MANAGER')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
