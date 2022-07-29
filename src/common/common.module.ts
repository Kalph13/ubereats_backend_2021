import { Global, Module } from "@nestjs/common";

/* PubSub: https://docs.nestjs.com/graphql/subscriptions#pubsub */
import { PubSub } from "graphql-subscriptions";
import { PUB_SUB } from "./common.constants";

const pubsub = new PubSub();

@Global()
@Module({
    providers: [{
        provide: PUB_SUB,
        useValue: pubsub
    }],
    exports: [PUB_SUB]
})
export class CommonModule {}
