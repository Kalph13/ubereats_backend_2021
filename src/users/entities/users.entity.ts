import { ObjectType, InputType, registerEnumType, Field } from "@nestjs/graphql";
import { InternalServerErrorException, Res } from "@nestjs/common";
import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import { CoreEntity } from "src/common/entities/core.entity";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { IsEmail, IsEnum, IsBoolean, IsString } from "class-validator";
import * as bcrypt from "bcrypt";

/* Replaced by Enum */
/* type UserRole = 'client' | 'owner' | 'delivery'; */

/* Enum: https://docs.nestjs.com/graphql/unions-and-enums#enums */
export enum UserRole {
    Client = "Client",
    Owner = "Owner",
    Delivery = "Delivery"
}
registerEnumType(UserRole, { name: 'UserRole' });

@InputType("UserInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
    @Column({ unique: true })
    @Field(type => String)
    @IsEmail()
    email: string;
    
    /* Hidden Column: https://typeorm.io/select-query-builder#hidden-columns */
    @Column({ select: false }) 
    @Field(type => String)
    @IsString()
    password: string;
    
    /* Replaced by Enum */
    /* @Column()
    @Field(type => String) */
    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @Column({ default: false })
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean;

    @Field(type => [Restaurant])
    @OneToMany(
        type => Restaurant,
        restaurant => restaurant.owner
    )
    restaurants: Restaurant[];

    /* @BeforeInsert: https://typeorm.io/listeners-and-subscribers#beforeinsert */
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
            try { 
                this.password = await bcrypt.hash(this.password, 10);
            } catch (e) {
                console.log(e)
                throw new InternalServerErrorException();
            }
        }
    }

    async checkPassword(receivedPassword: string): Promise<boolean> {
        try {
            const result = await bcrypt.compare(receivedPassword, this.password);
            return result;
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
    }
}
