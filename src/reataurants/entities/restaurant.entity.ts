import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString} from "class-validator";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { Dish } from "./dish.entity";
@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class Restaurant {

    @Field(type => String)
    @Column()
    @IsString()
    name: string;

    @Field(type => String, {defaultValue: "강남"})
    @Column()
    address: string;

    @Field(type => String)
    @Column()
    coverImg: string;

    @Field(type => Category, { nullable: true})
    @ManyToOne(
        type => Category,
        category => category.restaurants,
        {nullable: true, onDelete: 'SET NULL'},
    )
    category: Category;

    @Field(type => User)
    @ManyToOne(
        type => User,
        user => user.restaurants,
        {onDelete: 'CASCADE'}
    )
    owner: User;

    @RelationId((restaurant: Restaurant) => restaurant.owner)
    ownerId: number;


    @Field(type => [Dish])
    @OneToMany(
        type => Dish,
        dish => dish.restaurant,
    )
    menu: Dish[];
}