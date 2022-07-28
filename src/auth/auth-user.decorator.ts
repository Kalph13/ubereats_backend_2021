import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

/* Return the Information of the LoggedInUser */
export const AuthUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const { user } = gqlContext['loggedInUser']; /* req['loggedInUser'] = loggedInUser in JWTMiddleware */
        return user;
    }
);
