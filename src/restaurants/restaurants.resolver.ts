import { Args, Resolver, Query, Mutation, ResolveField, Int, Parent} from "@nestjs/graphql";
import { SetMetadata } from "@nestjs/common";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User, UserRole } from "src/users/entities/users.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { RestaurantService } from "./restaurants.service";
import { Category } from "./entities/category.entity";
import { AllRestaurantsInput, AllRestaurantsOutput } from "./dtos/all-restaurants.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";

/* @Resolver: https://docs.nestjs.com/graphql/resolvers */
/* - Similar to '*.resolvers.js' */
@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(
        private readonly restaurantService: RestaurantService
    ) {}

    /* @Query: https://docs.nestjs.com/graphql/resolvers#query-type-names */
    @Query(returns => AllRestaurantsOutput)
    allRestaurants(
        @Args("input") restaurantInput: AllRestaurantsInput
    ): Promise<AllRestaurantsOutput> {
        return this.restaurantService.allRestaurants(restaurantInput);
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

    @Mutation(returns => DeleteRestaurantOutput)
    @Role(["Owner"])
    async deleteRestaurant(
        @AuthUser() owner: User,
        @Args('input') deleteRestaurantInput: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        return this.restaurantService.deleteRestaurant(owner, deleteRestaurantInput);
    }
};

@Resolver(of => Category)
export class CategoryResolver {
    constructor (
        private readonly restaurantService: RestaurantService
    ) {}

    @Query(returns => AllCategoriesOutput)
    allCategories(): Promise<AllCategoriesOutput> {
        return this.restaurantService.allCategories();
    }

    @ResolveField(returns => Int)
    countRestaurants(@Parent() category: Category): Promise<number> {
        return this.restaurantService.countRestaurants(category);
    }

    @Query(returns => CategoryOutput)
    category(@Args("input") categoryInput: CategoryInput): Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryInput);
    }
}

/* 
------ Query Restaurants ------
query AllRestaurants {
    allRestaurants(input: {
        page: 1
    }) {
        GraphQLSucceed
        GraphQLError
        restaurants {
            name
        }
        totalPages
        totalResults
    }
}

------ Query AllCategories ------
query AllCategories {
    allCategories {
        GraphQLSucceed
        GraphQLError
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
}

------ Query Category ------
query Category {
    category (input: {
        slug: "***",
        page: 1
    }) {
        GraphQLSucceed
        GraphQLError
        category {
            id
            name
        }
        totalPages
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

------ Mutation EditRestaurant ------
mutation EditRestaurant {
    editRestaurant(input: {
        name: "***",
        restaurantId: ***
    }) {
        GraphQLSucceed
        GraphQLError
    }
}

------ Mutation DeleteRestaurant ------
mutation DeleteRestaurant {
    deleteRestaurant(input: {
        restaurantId: ***
    }) {
        GraphQLSucceed
        GraphQLError
    }
}
*/
