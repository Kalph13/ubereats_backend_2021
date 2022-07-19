import { Field, InputType, ObjectType } from "@nestjs/graphql"
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, JoinColumn, OneToOne, BeforeInsert } from "typeorm";
import { User } from "./users.entity";

/* uuid: https://www.npmjs.com/package/uuid */
import { v4 as uuidv4 } from 'uuid';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
    @Column()
    @Field(type => String)
    code: string;

    /* One-to-one Relations: https://typeorm.io/one-to-one-relations */
    @OneToOne(type => User)
    @JoinColumn()
    user: User;

    @BeforeInsert()
    createCode(): void {
        this.code = uuidv4();
    }
}
