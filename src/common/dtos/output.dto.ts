import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GraphQLOutput {
    @Field(type => Boolean)
    GraphQLSucceed: boolean;

    @Field(type => String, { nullable: true })
    GraphQLError?: string;
}