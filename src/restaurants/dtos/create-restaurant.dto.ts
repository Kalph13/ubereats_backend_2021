import { ArgsType, Field, InputType, OmitType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurants.entity";
import { IsBoolean, IsString, Length } from "class-validator";

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

/* @InputType: https://docs.nestjs.com/graphql/mapped-types */
/* - Similar to 'Fragment' */
/* OmitType: https://docs.nestjs.com/openapi/mapped-types#omit */
@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
