import { Resolver,Query, Mutation, Args } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/ceate-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";


@Resolver(of => User)
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Query(returns => Boolean)
    hi() {
        return true;
    }

    @Mutation(returns => CreateAccountOutput) //회원가입
    async createAccount(@Args("input") createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const [ok, error] = await this.usersService.createAccount(createAccountInput);
            return {
                ok,
                error,
            };
        } catch(error) {
            return {
                error,
                ok: false,
            };
        }
    }

    @Mutation(returns => LoginOutput) //로그인
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
        try {
            return await this.usersService.login(loginInput)
        } catch(error) {
            return {
                ok: false,
                error,
            };
        }
    }
}