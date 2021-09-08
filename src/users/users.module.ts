import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserResolver } from 'src/users/users.resolver';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Verification])],
    providers: [UserResolver, UserService],
    exports: [UserService]
})
export class UsersModule {}
