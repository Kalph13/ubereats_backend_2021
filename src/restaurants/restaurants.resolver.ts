import { Args, Resolver, Query, Mutation} from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurants.entity";
import { RestaurantService } from "./restaurants.service";

/* @Resolver: https://docs.nestjs.com/graphql/resolvers */
/* - Similar to '*.resolvers.js' */
@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(
        private readonly restaurantService: RestaurantService
    ) {}
    /* @Query: https://docs.nestjs.com/graphql/resolvers#query-type-names */
    @Query(returns => [Restaurant])
    restaurants(): Promise<Restaurant[]> {
        return this.restaurantService.getAll();
    }
    /* @Mutation: https://docs.nestjs.com/graphql/mutations */
    @Mutation(returns => Boolean)
    /* @Args: https://docs.nestjs.com/graphql/resolvers#args-decorator-options */
    async createRestaurant(@Args('input') createRestaurantDto: CreateRestaurantDto): Promise<boolean> {
        console.log("------ createRestaurant:", createRestaurantDto);
        try {
            await this.restaurantService.createRestaurant(createRestaurantDto);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
};
