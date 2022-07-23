import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entities/restaurants.entity";

@InputType()
export class RestaurantInput {
    @Field(type => Int)
    restaurandId: number;
}

@ObjectType()
export class RestaurantOutput extends GraphQLOutput {
    @Field(type => Restaurant, { nullable: true })
    restaurant?: Restaurant
}
