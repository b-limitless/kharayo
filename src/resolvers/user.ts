import { MyContext } from "src/types";
import {
  Resolver,
  Mutation,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import {getConnection} from "typeorm"

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}


@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string,
    @Ctx() {req, redis}: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {errors: [
        {
          field: "newPassword",
          message: "length must be greater then 2 characters",
        },
      ]
    }};

    // Check if token is 
    const key = FORGET_PASSWORD_PREFIX+token;
    const userID = await redis.get(key);

    if(!userID) {
      return {errors: [
        {
          field: "token",
          message: "token expired",
        },
      ]}
    }

    // update the entities 
    const userIdNum = parseInt(userID);
    const user = await User.findOne(userIdNum);

    // If user is not found 
    if(!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exits",
          },
        ]
      }
    }

    const password = await argon2.hash(newPassword);
    await User.update({id: userIdNum}, {password})

    // Delete the key after reseting the password 
    // Because it will not be useful 
    redis.del(key);
    // Log the user after chage password 
    req.session.userId = user.id;

    return {
      user
    }

  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() {redis }: MyContext
  ) {
    const user = await User.findOne({where: { email }});
    if (!user) {
      return true;
    }

    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // 3 days

    sendEmail(
      email,
      `<a href = "http://localhost:3000/change-password/${token}">Reset Password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return  User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() {req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result =  await getConnection() 
         .createQueryBuilder()
         .insert()
         .into(User).values({
            username: options.username,
            password: hashedPassword,
            email: options.email
         })
         .returning('*')
         .execute();
        user = result.raw[0];
  
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }
    req.session!.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() {req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: {email: usernameOrEmail }}
        : { where: {username: usernameOrEmail }}
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Username does not exits",
          },
        ],
      };
    }
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }
    req.session!.userId = user.id;
    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
