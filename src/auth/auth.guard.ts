/* Guard: https://docs.nestjs.com/guards */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

/* GraphQL Execution Context: https://docs.nestjs.com/graphql/other-features#execution-context */
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        console.log("------ AuthGuard ------ context:", context);
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const loggedInUser = gqlContext['user'];
        console.log("------ AuthGuard ------ loggedInUser:", loggedInUser);
        
        if (!loggedInUser) {
            return false;
        }

        return true;
    }
}
