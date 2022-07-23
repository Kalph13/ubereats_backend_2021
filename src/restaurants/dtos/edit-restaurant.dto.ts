import { ArgsType, Field, InputType, PartialType, ObjectType } from "@nestjs/graphql";
import { CreateRestaurantInput } from "./create-restaurant.dto";
import { GraphQLOutput } from "src/common/dtos/output.dto";
import { number } from "joi";

/* @InputType: https://docs.nestjs.com/graphql/mapped-types */
/* PartialType: https://docs.nestjs.com/openapi/mapped-types#partial */
@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
    @Field(type => Number)
    restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends GraphQLOutput {}
