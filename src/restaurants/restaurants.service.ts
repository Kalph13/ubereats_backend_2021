import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, Raw } from "typeorm";
import { User } from "src/users/entities/users.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
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

/* @Injectable: https://docs.nestjs.com/pipes#pipes */
@Injectable()
export class RestaurantService {
    constructor(
        /* @InjectRepository: https://docs.nestjs.com/techniques/database#repository-pattern */
        /* Similar to Prisma Client */
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories: Repository<Category>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>
    ) {}

    /* ------------------------ Restaurant Resolver ------------------------ */
    
    async allRestaurants({ page }: AllRestaurantsInput): Promise<AllRestaurantsOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                order: {
                    isPromoted: "DESC"
                },
                take: 3,
                skip: (page - 1) * 3
            });

            return {
                GraphQLSucceed: true,
                restaurants,
                totalPages: Math.ceil(totalResults / 3),
                totalResults
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't load restaurants"
            }
        }
    }

    async findRestaurantById({ restaurandId }: RestaurantInput): Promise<RestaurantOutput> {
        try {
            const findRestaurant = await this.restaurants.findOne({
                where: {
                    id: restaurandId
                },
                relations: {
                    menu: true
                }
            });

            if (!findRestaurant) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "The restaurant is not found"
                }
            }

            return {
                GraphQLSucceed: true,
                restaurant: findRestaurant
            }
        } catch {
            return { 
                GraphQLSucceed: false,
                GraphQLError: "Couldn't find the restaurant"
            }
        }
    }

    async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
        try {
            const restaurants = await this.restaurants.find({
                where: {
                    owner: {
                        id: owner.id
                    }
                }
            });

            return {
                GraphQLSucceed: true,
                restaurants
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't find the restaurants"
            }
        }
    }

    async searchRestaurantByName({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                where: {
                    /* name: Like(`%${query}%`) */
                    name: Raw(name => `${name} ILIKE '%${query}%'`)
                },
                take: 25,
                skip: ( page - 1 ) * 25
            });

            if (!restaurants) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "The Restaurant is not found"
                }
            }

            return {
                GraphQLSucceed: true,
                restaurants,
                totalResults,
                totalPages: Math.ceil(totalResults / 25)
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't find the restaurant"
            }
        }
    }

    async createRestaurant(owner: User, createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;
            newRestaurant.category = await this.getOrCreateCategory(createRestaurantInput.categoryName);
            await this.restaurants.save(newRestaurant);
            
            return { 
                GraphQLSucceed: true
            }
        } catch (GraphQLError) {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't create the restaurant"
            }
        }
    }

    async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
        try {
            const editedRestaurant = await this.restaurants.findOne({
                where: {
                    id: editRestaurantInput.restaurantId
                }
            });

            if (!editedRestaurant) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "Couldn't find the restaurant"
                }
            }
            
            if (owner.id !== editedRestaurant.ownerId) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "You're not authorized"
                }
            }

            let editedCategory: Category = null;
            if (editRestaurantInput.categoryName) {
                editedCategory = await this.getOrCreateCategory(editRestaurantInput.categoryName);
            }

            await this.restaurants.save([
                {
                    id: editRestaurantInput.restaurantId,
                    ...editRestaurantInput,
                    ...(editedCategory && { editedCategory })
                }
            ]);

            return {
                GraphQLSucceed: true
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't edit the restaurant"
            }
        };
    }

    async deleteRestaurant(owner: User, deleteRestaurantInput: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
        try {
            const deletedRestaurant = await this.restaurants.findOne({
                where: {
                    id: deleteRestaurantInput.restaurantId
                }
            })

            if (!deletedRestaurant) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "Couldn't find the restaurant"
                }
            }

            if (owner.id !== deletedRestaurant.ownerId) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "You're not authorized"
                }
            }

            await this.restaurants.delete({
                id: deletedRestaurant.id
            });

            return {
                GraphQLSucceed: true
            }

        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't delete the restaurant"
            }
        }
    }

    /* ------------------------ Category Resolver ------------------------ */
    
    async allCategories(): Promise<AllCategoriesOutput> {
        try {
            return {
                GraphQLSucceed: true,
                categories: await this.categories.find({
                    relations: {
                        restaurants: true
                    }
                })
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't load categories"
            }
        }
    }

    countRestaurants(category: Category) {
        return this.categories.count({
            where: {
                id: category.id
            }
        });
    }

    async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
        try {
            const findCategory  = await this.categories.findOne({
                where: {
                    slug
                }
            });

            if (!findCategory) {
                return {
                    GraphQLSucceed: true,
                    GraphQLError: "Couldn't find the category"
                }
            }

            const findRestaurants = await this.restaurants.find({
                where: {
                    category: {
                        slug
                    }
                },
                order: {
                    isPromoted: "DESC"
                },
                take: 25,
                skip: (page - 1) * 25
            })

            const totalResults = await this.countRestaurants(findCategory);

            return {
                GraphQLSucceed: true,
                category: findCategory,
                restaurants: findRestaurants,
                totalPages: Math.ceil(totalResults / 25)
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't load the category"
            }
        }
    };

    async getOrCreateCategory(name: string): Promise<Category> {
        const categoryName = name.trim().toLowerCase();
        const categorySlug = categoryName.replace(/ /g, '-');
        
        let category = await this.categories.findOne({ where: { slug: categorySlug } });
        if (!category) {
            category = await this.categories.save(this.categories.create({ slug: categorySlug, name: categoryName }));
        }

        return category;
    }

    /* ------------------------ Dish Resolver ------------------------ */

    async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOutput> {
        try {
            const findRestaurant = await this.restaurants.findOne({
                where: {
                    id: createDishInput.restaurantId
                }
            });

            if (!findRestaurant) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "The restaurant is not found"
                }
            }

            if (owner.id !== findRestaurant.ownerId) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "You're not authorized"
                }
            }

            const newDish = this.dishes.create({
                ...createDishInput,
                restaurant: findRestaurant
            }); 
            await this.dishes.save(newDish);
            
            return { 
                GraphQLSucceed: true
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't Create Dish"
            }
        }
    }

    async editDish(owner: User, editDishInput: EditDishInput): Promise<EditDishOutput> {
        try {
            const editedDish = await this.dishes.findOne({
                where: {
                    id: editDishInput.dishId
                },
                relations: {
                    restaurant: true
                }
            });

            if (!editedDish) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "Couldn't find the dish"
                }
            }

            if (editedDish.restaurant.ownerId !== owner.id) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "You're not authorized"
                }
            }

            await this.dishes.save({
                id: editDishInput.dishId,
                ...editDishInput
            });

            return {
                GraphQLSucceed: true
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't edit the dish"
            }
        }
    }

    async deleteDish(owner: User, deleteDishInput: DeleteDishInput): Promise<DeleteDishOutput> {
        try {
            const deletedDish = await this.dishes.findOne({
                where: {
                    id: deleteDishInput.dishId
                },
                relations: {
                    restaurant: true
                }
            });

            if (!deletedDish) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "Couldn't find the dish"
                }
            }

            if (deletedDish.restaurant.ownerId !== owner.id) {
                return {
                    GraphQLSucceed: false,
                    GraphQLError: "You're not authorized"
                }
            }

            await this.dishes.delete({
                id: deleteDishInput.dishId
            });

            return {
                GraphQLSucceed: true
            }
        } catch {
            return {
                GraphQLSucceed: false,
                GraphQLError: "Couldn't delete the dish"
            }
        }
    }
}
