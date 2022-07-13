import { Args, Resolver, Query, Mutation} from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurants.entity";

/* @Resolver: https://docs.nestjs.com/graphql/resolvers */
/* - Similar to '*.resolvers.js' */
@Resolver(of => Restaurant)
export class RestaurantsResolver {
    /* @Query: https://docs.nestjs.com/graphql/resolvers#query-type-names */
    @Query(returns => [Restaurant])
    /* @Args: https://docs.nestjs.com/graphql/resolvers#args-decorator-options */
    restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
        return [];
    }
    @Mutation(returns => Boolean)
    createRestaurant(@Args() CreateRestaurantDto: CreateRestaurantDto): boolean {
        return true;
    }
};
