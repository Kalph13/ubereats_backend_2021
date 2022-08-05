import { Field, ObjectType } from "@nestjs/graphql";
import { GraphQLOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entities/restaurants.entity";

@ObjectType()
export class MyRestaurantsOutput extends GraphQLOutput {
    @Field(type => [Restaurant])
    restaurants?: Restaurant[];
}
