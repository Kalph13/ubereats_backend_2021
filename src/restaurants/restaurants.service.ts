import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/users/entities/users.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { Category } from "./entities/category.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";

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
    
    getAll(): Promise<Restaurant[]> {
        return this.restaurants.find({
            relations: {
                category: true,
                owner: true
            }
        });
    }

    getCategories(): Promise<Category[]> {
        return this.categories.find({
            relations: {
                restaurants: true
            }
        });
    }

    async createRestaurant(owner: User, createRestaurantInput: CreateRestaurantInput): Promise<CreateRestaurantOutput> {
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;
            
            const categoryName = createRestaurantInput.categoryName.trim().toLowerCase();
            const categorySlug = categoryName.replace(/ /g, '-');
            
            let category = await this.categories.findOne({ where: { slug: categorySlug } });
            if (!category) {
                category = await this.categories.save(this.categories.create({ slug: categorySlug, name: categoryName }));
            }

            newRestaurant.category = category;
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

    updateRestaurant({ id, data }: UpdateRestaurantDto) {
        return this.restaurants.update(id, { ...data });
    }
}
