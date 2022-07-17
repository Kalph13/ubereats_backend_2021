import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
import { GraphQLOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/users.entity";

/* @ArgsType: https://docs.nestjs.com/graphql/resolvers#dedicated-arguments-class */
/* @ArgsType (Individual Args) vs. @InputType (Object): https://typegraphql.com/docs/faq.html#is-inputtype-different-from-argstype */
@ArgsType()
export class UserProfileInput {
    @Field(type => Number)
    userId: number;
}

@ObjectType()
export class UserProfileOutput extends GraphQLOutput {
    @Field(type => User, { nullable: true })
    user?: User;
}
