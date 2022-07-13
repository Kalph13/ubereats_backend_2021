import { ArgsType, Field } from "@nestjs/graphql";

/* Class Validator: https://docs.nestjs.com/pipes#class-validator */
import { IsBoolean, IsString, Length } from "class-validator";

/* @ArgsType: https://docs.nestjs.com/graphql/resolvers#args-decorator-options */
/* - Similar to '*.typeDefs.js' of Resolver */
@ArgsType()
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
}
