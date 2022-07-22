import { ObjectType, InputType, Field } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Category } from "./category.entity";
import { User } from "src/users/entities/users.entity";

/* Class Validator: https://docs.nestjs.com/pipes#class-validator */
import { IsBoolean, IsString, IsOptional, Length } from "class-validator";

/* TypeORM Entity: https://typeorm.io/entities */
/* - Similar to 'prisma.schema' */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

/* @InputType: https://docs.nestjs.com/graphql/mapped-types (Must be Declared Before @ObjectType) */
/* @ObjectType: https://docs.nestjs.com/graphql/resolvers#object-types */
/* - Similar to '*.typeDefs.js' of Model */
@InputType("RestaurantInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
    @Field(type => String) /* Connect to GraphQL*/
    @Column() /* Connect to TypeORM*/
    @IsString() /* Validate the Type */
    @Length(5)
    name: string;

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string;

    @Field(type => String, { defaultValue: "seoul" })
    @Column()
    @IsString()
    address: string;

    @Field(type => Category, { nullable: true })
    @ManyToOne(
        type => Category,
        category => category.restaurants,
        { nullable: true, onDelete: "SET NULL" }
    )
    category: Category;

    @Field(type => User)
    @ManyToOne(
        type => User,
        user => user.restaurants   
    )
    owner: User;

    /* @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number;
    
    @Field(type => Boolean, { nullable: true })
    @Column({ default: true })
    @IsOptional()
    @IsBoolean()
    isVegan: boolean;
    
    @Field(type => String)
    @Column()
    @IsString()
    ownerName: string;
    
    @Field(type => String)
    @Column()
    @IsString()
    categoryName: string; */
}
