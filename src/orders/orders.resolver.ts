import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service"

@Resolver(of => Order)
export class OrderResolver {
    constructor(private readonly ordersService: OrderService) {}

    @Mutation(returns => CreateOrderOutput)
    @Role(["Client"])
    async createOrder(
        @AuthUser() 
        @Args('input')
        customer: User, 
        createOrderInput: CreateOrderInput
    ):Promise<CreateOrderOutput> {
        return this.ordersService.createOrder(customer, createOrderInput);
    }
}