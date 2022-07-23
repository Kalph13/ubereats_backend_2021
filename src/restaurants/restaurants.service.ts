import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/users/entities/users.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { Category } from "./entities/category.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";

/* @Injectable: https://docs.nestjs.com/pipes#pipes */
@Injectable()
export class RestaurantService {
    constructor(
        /* @InjectRepository: https://docs.nestjs.com/techniques/database#repository-pattern */
        /* Similar to Prisma Client */
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories: Repository<Category>
    ) {}
    
    getAll() {
        return this.restaurants.find({
            relations: {
                category: true,
                owner: true
            }
        });
    }

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

    async findCategoryBySlug({ slug }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category  = await this.categories.findOne({
                where: {
                    slug
                },
                relations: {
                    restaurants: true
                }
            });

            if (!category) {
                return {
                    GraphQLSucceed: true,
                    GraphQLError: "Couldn't find the category"
                }
            }

            return {
                GraphQLSucceed: true,
                category
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
}
