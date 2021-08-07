import "reflect-metadata";
import { __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from 'cors';
import {createConnection} from 'typeorm';
import { COOKIE_NAME } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
// import { sendEmail } from "./utils/sendEmail";

export const main = async () => {
 await createConnection({
    type: "postgres",
    database: 'kharayo1',
    username: 'limitless',
    password: 'aaff',
    logging: true,
    synchronize: true,
    entities: [Post, User]
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis({});

  app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }));
  
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ 
           client: redis,
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
    
    context: ({req, res}) => ({
      req,
      res,
      redis
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
