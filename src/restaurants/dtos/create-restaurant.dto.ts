import { ArgsType, Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";
import { Restaurant } from "../entities/restaurants.entity";
import { GraphQLOutput } from "src/common/dtos/output.dto";

/* @InputType: https://docs.nestjs.com/graphql/mapped-types */
/* OmitType: https://docs.nestjs.com/openapi/mapped-types#omit */
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
    "name",
    "coverImg",
    "address"
]) {
    @Field(type => String)
    categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends GraphQLOutput {
    @Field(type => Int, { nullable: true })
    restaurantId?: number;
}

/* @ArgsType: https://docs.nestjs.com/graphql/resolvers#args-decorator-options */
/* - Similar to '*.typeDefs.js' of Resolver */

/* Replaced by @InputType */
/* @ArgsType()
export class CreateRestaurantDto {
    @Field(type => String)
    @IsString()
    @Length(5, 10)
    name: string;

    @Field(type => Boolean)
    @IsBoolean()
    isVegan: boolean;

    @Field(type => String)
    @IsString()
    address: string;
    
    @Field(type => String)
    @IsString()
    ownerName: string;
} */
