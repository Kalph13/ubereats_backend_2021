import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const AuthUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        console.log("------ AuthUser ------ context:", context);
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const loggedInUser = gqlContext['user'];
        console.log("------ AuthUser ------ loggedInUser:", loggedInUser);
        return loggedInUser;
    }
);
