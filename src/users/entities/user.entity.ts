import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "../../common/entities/core.entity";
import { BeforeInsert, Column, Entity, OneToMany } from "typeorm";
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from "@nestjs/common";
import { IsEmail, IsEnum } from "class-validator";
import { Restaurant } from "src/reataurants/entities/restaurant.entity";
import { Order } from "src/orders/entities/order.entity";

export enum UserRole {
    Client = "Client",
    Owner = "Owner",
    Delivery = "Delivery"
}

registerEnumType(UserRole, {name: "UserRole"})

@InputType({ isAbstract: true})
@ObjectType()
@Entity()
export class User extends CoreEntity {

    @Column({unique: true})
    @Field(type=> String)
    @IsEmail()
    email: string;

    @Column({select: false})
    @Field(type=> String)
    password: string;

    @Column( {type : 'enum', enum: UserRole} )
    @Field(type=> String)
    @IsEnum(UserRole)
    role: UserRole;

    @Column({default: false})
    @Field(type=> Boolean)
    verified: boolean;

    @Field(type => [Order])
    @OneToMany(
        type => Order,
        order => order.customer,
    )
    orders: Order[];

    @Field(type => [Order])
    @OneToMany(
        type => Order,
        order => order.driver,
    )
    rides: Order[];

    @Field(type => [Restaurant])
    @OneToMany(
        type => Restaurant,
        restaurant => restaurant.owner,
    )
    restaurants: Restaurant[];

    @BeforeInsert()
    async hashPassword(): Promise<void> {
        if(this.password) {
            try {
                this.password = await bcrypt.hash(this.password, 10);
            } catch(e) {
                console.log(e);
                throw new InternalServerErrorException();
            }
        }
    } 

    async checkPassword(aPassword:string): Promise<boolean> {
        try {
            const ok = await bcrypt.compare(aPassword, this.password);
            return ok;
        } catch(e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
    }

}