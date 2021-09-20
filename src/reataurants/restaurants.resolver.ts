import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { createRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/edit-restaurant.dto';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService) {}

    @Mutation(returns => CreateRestaurantOutput)
    @Role(['Owner'])
    async createRestaurant(
        @AuthUser() authUser: User,
        @Args('input') createRestaurantInput: createRestaurantInput,
    ): Promise<CreateRestaurantOutput> {
        return this.restaurantService.createRestaurant(
            authUser,
            createRestaurantInput,
        );
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
    @Role(['Owner'])
    deleteRestaurant(
        @AuthUser() owner: User,
        @Args('input') deleteRestaurantInput: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        return this.restaurantService.deleteRestaurant(
            owner, deleteRestaurantInput
        );
    };
}



@Resolver(of => Dish)
export class DishResolver {
    constructor(private readonly restaurantService: RestaurantService) {}
    @Mutation(type => CreateDishOutput)
    @Role(["Owner"])
    createDish(
        @AuthUser() owner: User,
        @Args('input') createDishInput: CreateDishInput
    ):Promise<CreateDishOutput> {
        return this.restaurantService.createDish(owner, createDishInput);
    }

    @Mutation(type => EditDishOutput)
    @Role(["Owner"])
    editDish(
        @AuthUser() owner: User,
        @Args('input') editDishInput: EditDishInput
    ):Promise<EditDishOutput> {
        return this.restaurantService.editDish(owner, editDishInput);
    }

    @Mutation(type => DeleteDishOutput)
    @Role(["Owner"])
    deleteDish(
        @AuthUser() owner: User,
        @Args('input') deleteDishInput: DeleteDishInput
    ):Promise<DeleteDishOutput> {
        return this.restaurantService.deleteDish(owner, deleteDishInput);
    }
}

