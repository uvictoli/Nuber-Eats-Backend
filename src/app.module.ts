import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReataurantsModule } from './reataurants/reataurants.module';
import { Restaurant } from './reataurants/entities/restaurant.entity';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';

import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "dev" ? ".dev.env" : ".test.env",
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      /*
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
      */
    }),

    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),

    ReataurantsModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: process.env.NODE_ENV !== 'prod',
      entities: [User]
    }),

    UsersModule,

    CommonModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
