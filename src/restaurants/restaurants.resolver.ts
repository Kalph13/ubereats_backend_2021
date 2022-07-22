import { Args, Resolver, Query, Mutation} from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/users.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { RestaurantService } from "./restaurants.service";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
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
    /* @Args: https://docs.nestjs.com/graphql/resolvers#args-decInputtor-options */    
    @Mutation(returns => CreateRestaurantOutput)
    async createRestaurant(
        @AuthUser() authUser: User,
        @Args('input') createRestaurantInput: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> {
        return this.restaurantService.createRestaurant(authUser, createRestaurantInput);
    }
   
    @Mutation(returns => Boolean)
    async updateRestaurant(
        @Args('input') updateRestaurantDto: UpdateRestaurantDto
    ): Promise<boolean> {
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
------ Query Restaurants ------
query Restaurants {
    restaurants {
        id
        createdAt
        updatedAt
        name
        coverImg
        address
        category {
            name
        }
        owner {
            email
        }
    }
}

------ Mutation CreateRestaurant ------
mutation CreateRestaurant {
    createRestaurant(input: {
        name: "***",
        ownerName: "***",
        categoryName: "***"
    })
}

------ Mutation UpdateRestaurant ------
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
