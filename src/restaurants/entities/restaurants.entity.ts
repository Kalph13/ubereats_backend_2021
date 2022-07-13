import { ObjectType, Field } from "@nestjs/graphql";

/* @ObjectType: https://docs.nestjs.com/graphql/resolvers#object-types */
/* - Similar to '*.typeDefs.js' of Model */
@ObjectType()
export class Restaurant {
    @Field(type => String)
    name: string;
    @Field(type => Boolean)
    isVegan: boolean;
    @Field(type => String)
    address: string;
    @Field(type => String)
    ownerName: string;
}
