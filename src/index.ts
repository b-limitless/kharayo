import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from 'cors';
import { MyContext } from "./types";
import { COOKIE_NAME } from "./constants";
import { sendEmail } from "./utils/sendEmail";
export const main = async () => {
  sendEmail('bharatrose1@gmail.com', 'Hello Bharat');
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }));
  
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ 
           client: redisClient,
           disableTTL: true,
           disableTouch: true
        }),
      cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years 
          httpOnly: true,
          sameSite: 'lax', // csrf 
          secure: __prod__ // cookie only work in https
        },
      saveUninitialized: false,
      secret: "secret",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    
    context: ({req, res}): MyContext => ({
      em: orm.em,
      req,
      res
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ 
    app,
    cors: false
  });

  app.listen(4000, () => {
    console.log("server started on localhost:");
  });
};

main().catch((err) => {
  console.log(err);
});
