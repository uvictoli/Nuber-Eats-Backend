import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { createRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant) 
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Dish) 
        private readonly dishes: Repository<Dish>,
        private readonly categories: CategoryRepository,
        ) {}

    async createRestaurant(
        owner: User,
        createRestaurantInput: createRestaurantInput
        ): Promise<CreateRestaurantOutput> {
            try {
                const newRestaurant = this.restaurants.create(createRestaurantInput);
                const category = await this.categories.getOrCreate(
                    createRestaurantInput.categoryName,
                );
                newRestaurant.owner = owner;
                await this.restaurants.save(newRestaurant); 
                newRestaurant.category = category;
                await this.restaurants.save(newRestaurant);
                return {
                    ok: true,
                }; 
            } 
         catch {
            return {
                ok: false,
                error: "Could not create restaurant"
            };
        }
    }
    
    async editRestaurant(
        owner: User, 
        editRestaurantInput: EditRestaurantInput
        ): Promise<EditRestaurantOutput> {
            try {
                const restaurant = await this.restaurants.findOne(
                    editRestaurantInput.restaurantId, 
                );
                if(!restaurant) {
                    return {
                        ok: false,
                        error: "Restaurant not found"
                    };
                }
                if(owner.id !== restaurant.ownerId) {
                    return {
                        ok: false,
                        error: "You can't edit a restaurant that you don't own."
                    };
                }
                let category: Category = null;
                if(editRestaurantInput.categoryName) {
                    category = await this.categories.getOrCreate(
                        editRestaurantInput.categoryName
                        );
                }
                await this.restaurants.save([{
                    id: editRestaurantInput.restaurantId,
                    ...editRestaurantInput,
                    ...(category && {category}),
                }]);
                return {
                    ok: true,
                };
            } catch {
                return {
                    ok:false,
                    error: "Could not edit Restaurant"
                };
            }
    }

    async deleteRestaurant(
        owner: User, 
        {restaurantId}: DeleteRestaurantInput
        ): Promise<DeleteRestaurantOutput> {
            try {
                const restaurant = await this.restaurants.findOne(
                    restaurantId, 
                );
                if(!restaurant) {
                    return {
                        ok: false,
                        error: "Restaurant not found"
                    };
                }
                if(owner.id !== restaurant.ownerId) {
                    return {
                        ok: false,
                        error: "You can't delete a restaurant that you don't own."
                    };
                }
                await this.restaurants.delete(restaurantId);
                return {
                    ok: true,
                };
            } catch {
                return {
                    ok: false,
                    error: "Could not delete"
                };
            }
    }

    async createDish(
        owner: User, 
        createDishInput: CreateDishInput
        ): Promise<CreateDishOutput> {
            try {
            const restaurant = await this.restaurants.findOne(
                createDishInput.restaurantId
            );
            if(!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found"
                };
            }
            if(owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't do that."
                };
            }
            await this.dishes.save(
                this.dishes.create({...createDishInput, restaurant})
            );
            return {
                ok: true,
            };
        } catch(error) {
            return {
                ok: false,
                error: "Could not create dish"
            };
        }
    }

    async editDish(
        owner:User, 
        editDishInput:EditDishInput
        ): Promise<EditDishOutput> {
            try {
                const dish = await this.dishes.findOne(editDishInput.dishId, {
                    relations:["restaurant"]
                });
                if (!dish) {
                    return {
                        ok: false,
                        error: "Dish not found"
                    };
                }
                if (dish.restaurant.ownerId !== owner.id) {
                    return {
                        ok: false,
                        error: "You can't do that."
                    };
                }
                await this.dishes.save([
                    {
                    id: editDishInput.dishId,
                    ...editDishInput,
                }
                ]);
                return {
                    ok: true
                };
            } catch {
                return {
                    ok: false,
                    error: "Could not delete dish"
                };
            }
    }

    async deleteDish(
        owner:User, 
        {dishId}:DeleteDishInput
        ): Promise<DeleteDishOutput> {
            try {
                const dish = await this.dishes.findOne(dishId, {
                    relations:["restaurant"]
                });
                if (!dish) {
                    return {
                        ok: false,
                        error: "Dish not found"
                    };
                }
                if (dish.restaurant.ownerId !== owner.id) {
                    return {
                        ok: false,
                        error: "You can't do that."
                    };
                }
                await this.dishes.delete(dishId);
                return {
                    ok: true
                };
            } catch {
                return {
                    ok: false,
                    error: "Could not delete dish"
                };
            }
    }

}