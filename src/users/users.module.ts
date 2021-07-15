import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersResolver } from 'src/users/users.resolver';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersResolver, UsersService],
})
export class UsersModule {}
