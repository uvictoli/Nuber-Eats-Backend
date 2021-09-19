import { Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { createRestaurantInput } from "./create-restaurant.dto";

@InputType()
export class EditRestaurantInput extends PartialType(createRestaurantInput) {
    @Field(type => Number)
    restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}