import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class Restaurant {

    @PrimaryGeneratedColumn()
    @Field(type=> Number)
    id: number

    @Field(type => String)
    @Column()
    @IsString()
    name: string;

    @Field(type => Boolean, { nullable: true})
    @Column({default: true})
    @IsOptional()
    @IsBoolean()
    isVegan?: Boolean;

    @Field(type => String, {defaultValue: "강남"})
    @Column()
    address: string;

    @Field(type => String)
    @Column()
    @Length(5)
    ownerName: string;

    @Field(type => String)
    @Column()
    categoryName: string;
}