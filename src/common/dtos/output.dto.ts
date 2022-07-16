import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class MutationOutput {
    @Field(type => Boolean)
    mutationSucceed: boolean;

    @Field(type => String, { nullable: true })
    mutationError?: string;
}