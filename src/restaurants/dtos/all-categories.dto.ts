import { ObjectType, Field } from "@nestjs/graphql";
import { GraphQLOutput } from "src/common/dtos/output.dto";
import { Category } from "../entities/category.entity";

@ObjectType()
export class AllCategoriesOutput extends GraphQLOutput {
    @Field(type => [Category], { nullable: true })
    categories?: Category[]
}
