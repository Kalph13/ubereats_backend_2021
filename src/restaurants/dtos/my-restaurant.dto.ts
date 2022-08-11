import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { GraphQLOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entities/restaurants.entity";

@InputType()
export class MyRestaurantInput extends PickType(Restaurant, ["id"]) {}

@ObjectType()
export class MyRestaurantOutput extends GraphQLOutput {
    @Field(type => Restaurant, { nullable: true })
    restaurant?: Restaurant;
}
