import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

export const main = async() => {
    const orm = await MikroORM.init({
        dbName:'kharayo',
        entities: [Post],
        user:'',
        password:'',
        type: 'postgresql',
        debug: !__prod__
    });

    const post = orm.em.create(Post, {title: 'hello world'});
    await orm.em.persistAndFlush(post);
    return orm;
}

main();