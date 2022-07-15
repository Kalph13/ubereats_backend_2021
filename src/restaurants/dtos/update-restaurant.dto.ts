import { ArgsType, Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./create-restaurant.dto";

/* @InputType: https://docs.nestjs.com/graphql/mapped-types */
/* - Similar to 'Fragment' */
/* PartialType: https://docs.nestjs.com/openapi/mapped-types#partial */
@InputType()
class UpdateRestaurantInputType extends PartialType(
    CreateRestaurantDto
) {}

@InputType()
export class UpdateRestaurantDto {
    @Field(type => Number)
    id: number;
    @Field(type => UpdateRestaurantInputType)
    data: UpdateRestaurantInputType
}
