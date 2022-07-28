import { User } from "src/users/entities/users.entity";
import { AllowedRoles } from "./role.decorator";
import { JwtService } from "src/jwt/jwt.service";
import { UserService } from "src/users/users.service";

/* Guard: https://docs.nestjs.com/guards */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

/* Reflector: https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata */
import { Reflector } from "@nestjs/core";

/* GraphQL Execution Context: https://docs.nestjs.com/graphql/other-features#execution-context */
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    async canActivate(context: ExecutionContext) {
        const roles = this.reflector.get<AllowedRoles>("roles", context.getHandler());
        console.log("------ AuthGuard ------ roles:", roles);
        
        if (!roles) {
            return true;
        }
        
        const gqlContext = GqlExecutionContext.create(context).getContext();
        console.log("------ AuthGuard ------ gqlContext.loginToken:", gqlContext["loginToken"]);

        const loginToken = gqlContext.loginToken;

        if (loginToken) {
            const decoded = this.jwtService.verify(loginToken.toString());
                if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
                    const loggedInUser = await this.userService.findById(decoded['id']);
                    if (loggedInUser.GraphQLSucceed) {
                        gqlContext['loggedInUser'] = loggedInUser;
                        if (roles.includes("Any")) {
                            return true;
                        }
                        return roles.includes(loggedInUser.user.role);
                    }
                }
        }

        return false;

        /* Replaced by JwtMiddleware Code to Use Subscription (Subscription Can't Activate JwtMiddleware Due to Use of WebSockets, Not HTTP) */
        /* const { user } = gqlContext['loggedInUser']; // req['loggedInUser'] = loggedInUser in JWTMiddleware 
        
        if (!user) {
            return false;
        }

        if (roles.includes("Any")) {
            return true;
        }

        return roles.includes(user.role); */
    }
}
