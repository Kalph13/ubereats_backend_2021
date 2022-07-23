import { Args, Resolver, Query, Mutation} from "@nestjs/graphql";
import { SetMetadata } from "@nestjs/common";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User, UserRole } from "src/users/entities/users.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { RestaurantService } from "./restaurants.service";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { Category } from "./entities/category.entity";

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

    @Query(returns => [Category])
    categories(): Promise<Category[]> {
        return this.restaurantService.getCategories();
    }

    /* @Mutation: https://docs.nestjs.com/graphql/mutations */
    /* @Args: https://docs.nestjs.com/graphql/resolvers#args-decInputtor-options */    
    @Mutation(returns => CreateRestaurantOutput)
    @Role(["Owner"])
    async createRestaurant(
        @AuthUser() owner: User,
        @Args('input') createRestaurantInput: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> {
        return this.restaurantService.createRestaurant(owner, createRestaurantInput);
    }
   
    @Mutation(returns => EditRestaurantOutput)
    @Role(["Owner"])
    async editRestaurant(
        @AuthUser() owner: User,
        @Args('input') editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOutput> {
        return this.restaurantService.editRestaurant(owner, editRestaurantInput);
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

------ Query Categories ------
query Categories {
    categories {
        id
        createdAt
        updatedAt
        name
        coverImg
        slug
        restaurants {
            name
        }
    }
}

------ Mutation CreateRestaurant ------
mutation CreateRestaurant {
    createRestaurant(input: {
        name: "***",
        coverImg: "***",
        address: "***",
        categoryName: "***"
    }) {
        GraphQLSucceed
        GraphQLError
    }
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
