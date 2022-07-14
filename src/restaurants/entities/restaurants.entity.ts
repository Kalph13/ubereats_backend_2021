import { ObjectType, InputType, Field } from "@nestjs/graphql";

/* Class Validator: https://docs.nestjs.com/pipes#class-validator */
import { IsBoolean, IsString, IsOptional, Length } from "class-validator";

/* TypeORM Entity: https://typeorm.io/entities */
/* - Similar to 'prisma.schema' */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/* @InputType: https://docs.nestjs.com/graphql/mapped-types */
/* - Similar to 'Fragment' (Must be Declared Before @ObjectType) */
/* @ObjectType: https://docs.nestjs.com/graphql/resolvers#object-types */
/* - Similar to '*.typeDefs.js' of Model */
@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
    @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number;
    @Field(type => String) /* Connect to GraphQL*/
    @Column() /* Connect to TypeORM*/
    @IsString() /* Validate the Type */
    @Length(5)
    name: string;
    @Field(type => Boolean, { nullable: true })
    @Column({ default: true })
    @IsOptional()
    @IsBoolean()
    isVegan: boolean;
    @Field(type => String, { defaultValue: "seoul" })
    @Column()
    @IsString()
    address: string;
    @Field(type => String)
    @Column()
    @IsString()
    ownerName: string;
    @Field(type => String)
    @Column()
    @IsString()
    categoryName: string;
}
