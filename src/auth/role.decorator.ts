import { UserRole } from "src/users/entities/users.entity";

/* Authorization: Determines What a User Can Do (https://docs.nestjs.com/security/authorization) */
import { SetMetadata } from "@nestjs/common";

export type AllowedRoles = keyof typeof UserRole | "Any";

export const Role = (roles: AllowedRoles[]) => SetMetadata("roles", roles);
