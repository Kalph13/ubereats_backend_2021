import { Args, Resolver, Query, Mutation, ResolveField, Int, Parent} from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/users.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
import { RestaurantService } from "./restaurants.service";
import { AllRestaurantsInput, AllRestaurantsOutput } from "./dtos/all-restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { MyRestaurantsOutput } from "./dtos/my-restaurants.dto";
import { MyRestaurantInput, MyRestaurantOutput } from "./dtos/my-restaurant.dto";

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

    @Query(returns => RestaurantOutput)
    restaurant(
        @Args("input") restaurantInput: RestaurantInput
    ): Promise<RestaurantOutput> {
        return this.restaurantService.findRestaurantById(restaurantInput);
    }

    @Query(returns => MyRestaurantsOutput)
    @Role(["Owner"])
    myRestaurants(
        @AuthUser() owner: User
    ): Promise<MyRestaurantsOutput> {
        return this.restaurantService.myRestaurants(owner);
    }

    @Query(returns => MyRestaurantOutput)
    @Role(["Owner"])
    myRestaurant(
        @AuthUser() owner: User,
        @Args("input") myRestaurantInput: MyRestaurantInput
    ): Promise<MyRestaurantOutput> {
        return this.restaurantService.myRestaurant(owner, myRestaurantInput);
    }

    @Query(returns => SearchRestaurantOutput)
    searchRestaurant(
        @Args("input") searchRestaurantInput: SearchRestaurantInput
    ): Promise<SearchRestaurantOutput> {
        return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
    }    

    /* @Mutation: https://docs.nestjs.com/graphql/mutations */
    /* @Args: https://docs.nestjs.com/graphql/resolvers#args-decInputtor-options */    
    @Mutation(returns => CreateRestaurantOutput)
    @Role(["Owner"])
    createRestaurant(
        @AuthUser() owner: User,
        @Args('input') createRestaurantInput: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> {
        return this.restaurantService.createRestaurant(owner, createRestaurantInput);
    }
   
    @Mutation(returns => EditRestaurantOutput)
    @Role(["Owner"])
    editRestaurant(
        @AuthUser() owner: User,
        @Args('input') editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOutput> {
        return this.restaurantService.editRestaurant(owner, editRestaurantInput);
    }

    @Mutation(returns => DeleteRestaurantOutput)
    @Role(["Owner"])
    deleteRestaurant(
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

@Resolver(of => Dish)
export class DishResolver {
    constructor (
        private readonly restaurantService: RestaurantService
    ) {}

    @Mutation(returns => CreateDishOutput)
    @Role(["Owner"])
    createDish(
        @AuthUser() owner: User,
        @Args("input") createDishInput: CreateDishInput
    ): Promise<CreateDishOutput> {
        return this.restaurantService.createDish(owner, createDishInput);
    }

    @Mutation(returns => EditDishOutput)
    @Role(["Owner"])
    editDish(
        @AuthUser() owner: User,
        @Args("input") editDishInput: EditDishInput
    ): Promise<EditDishOutput> {
        return this.restaurantService.editDish(owner, editDishInput);
    }

    @Mutation(returns => DeleteDishOutput)
    @Role(["Owner"])
    deleteDish(
        @AuthUser() owner: User,
        @Args("input") deleteDishInput: DeleteDishInput
    ): Promise<DeleteDishOutput> {
        return this.restaurantService.deleteDish(owner, deleteDishInput);
    }
}

/* 
------ Query AllRestaurants ------
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

------ Query Restaurant ------
query Restaurant {
    restaurant (input: {
        restaurandId: ***
    }) {
        GraphQLSucceed
        GraphQLError
        restaurant {
            id
            name
        }
    }
}

------ Query SearchRestaurant ------
query SearchRestaurant {
    searchRestaurant (input: {
        query: "***",
        page: ***
    }) {
        GraphQLSucceed,
        GraphQLError,
        totalPages,
        totalResults,
        restaurants {
            id,
            name
        }
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

------ Mutation CreateDish ------
mutation CreateDish {
    createDish(input: {
        name: "***",
        price: ***,
        description: "***",
        options: {
            name: "***",
            extra: ***,
            choices: {
                name: "***",
                extra: ***
            }
        },
        restaurantId: ***
    }) {
        GraphQLSucceed
        GraphQLError
    }
}

------ Mutation EditDish ------
mutation EditDish {
    editDish (input: {
        name: "***",
        price: ***,
        description: "***",
        options: {
            name: "***",
            extra: ***,
            choices: {
                name: "***",
                extra: ***
            }
        },
        dishId: ***
    }) {
        GraphQLSucceed
        GraphQLError
    }
}

------ Mutation DeleteDish ------
mutation DeleteDish {
    deleteDish (input: {
        dishId: ***
    }) {
        GraphQLSucceed
        GraphQLError
    }
}
*/
