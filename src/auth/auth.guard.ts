import { User } from "src/users/entities/users.entity";
import { AllowedRoles } from "./role.decorator";

/* Guard: https://docs.nestjs.com/guards */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

/* Reflector: https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata */
import { Reflector } from "@nestjs/core";

/* GraphQL Execution Context: https://docs.nestjs.com/graphql/other-features#execution-context */
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector
    ) {}

    canActivate(context: ExecutionContext) {
        const roles = this.reflector.get<AllowedRoles>("roles", context.getHandler());
        console.log("------ AuthGuard ------ roles:", roles);
        
        if (!roles) {
            return true;
        }
        
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const { user } = gqlContext['user']; /* req['user'] = loggedInUser in JWTMiddleware */
        
        if (!user) {
            return false;
        }

        if (roles.includes("Any")) {
            return true;
        }

        return roles.includes(user.role);
    }
}
