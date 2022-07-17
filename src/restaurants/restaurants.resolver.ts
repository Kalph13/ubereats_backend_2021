import { Args, Resolver, Query, Mutation} from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurants.entity";
import { RestaurantService } from "./restaurants.service";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";

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
    /* @Args: https://docs.nestjs.com/graphql/resolvers#args-decorator-options */    
    @Mutation(returns => Boolean)
    async createRestaurant(
        @Args('input') createRestaurantDto: CreateRestaurantDto
    ): Promise<boolean> {
        console.log("------ createRestaurant:", createRestaurantDto);
        try {
            await this.restaurantService.createRestaurant(createRestaurantDto);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
   
    @Mutation(returns => Boolean)
    async updateRestaurant(
        @Args('input') updateRestaurantDto: UpdateRestaurantDto
    ): Promise<boolean> {
        console.log("----- updateRestaurant:", updateRestaurantDto);
        try {
            await this.restaurantService.updateRestaurant(updateRestaurantDto);
            return true
        } catch (e) {
            console.log(e);
            return false;
        }
    }
};

/* 
    query Restaurants {
        restaurants {
            id
            name
            isVegan
            address
            ownerName
            categoryName
        }
    }

    mutation CreateRestaurant {
        createRestaurant(input: {
            name: "***",
            ownerName: "***",
            categoryName: "***"
        })
    }

    mutation UpdateRestaurant {
        updateRestaurant(input: {
            id: *** (Number),
            data:{
                isVegan: true | false,
                categoryName: "***"
            }
        })
    }
*/
