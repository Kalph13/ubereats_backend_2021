import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLOutput } from "./output.dto";

@InputType()
export class PaginationInput {
    @Field(type => Int, { defaultValue: 1 })
    page: number;
}

@ObjectType()
export class PaginationOutput extends GraphQLOutput{
    @Field(type => Int, { nullable: true })
    totalPages?: number

    @Field(type => Int, { nullable: true })
    totalResults?: number
}
