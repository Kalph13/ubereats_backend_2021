/* Guard: https://docs.nestjs.com/guards */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

/* GraphQL Execution Context: https://docs.nestjs.com/graphql/other-features#execution-context */
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const { user } = gqlContext['user']; /* req['user'] = loggedInUser in JWTMiddleware */
        
        if (!user) {
            return false;
        }

        return true;
    }
}
