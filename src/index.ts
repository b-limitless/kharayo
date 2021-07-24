import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
export const main = async() => {
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();
    
    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            validate: false
        }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({app});

    app.listen(4000, () => {
        console.log('server started on localhost:')
    });
   
}

main().catch(err => {
    console.log(err)
});