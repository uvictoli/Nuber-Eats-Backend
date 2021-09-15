import { UseGuards } from "@nestjs/common";
import { Resolver,Query, Mutation, Args } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { Role } from "src/auth/role.decorator";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/ceate-account.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./users.service";


@Resolver(of => User)
export class UserResolver {
    constructor(
        private readonly usersService: UserService
    ) {}

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
                ok: false,
                error,
            };
        }
    }

    @Mutation(returns => LoginOutput) //로그인
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
        try {
            const { ok, error, token } = await this.usersService.login(loginInput);
            return { ok, error, token };
        } catch(error) {
            return {
                ok: false,
                error,
            };
        }
    }

    @Query(returns => User)
    @Role(["Any"])
    me(@AuthUser() authUser: User) {
        return authUser;
    }

    @Role(['Any'])
    @Query(retuerns => UserProfileOutput)
    async userProfile(@Args() userProfileINput: UserProfileInput
    ): Promise<UserProfileOutput> {
        try {
            const user = await this.usersService.findById(userProfileINput.userId);
            if (!user) {
                throw Error();
            }
            return {
                ok: true,
                user,
            } 
        } catch(e) {
            return {
                ok: false,
                error: "User Not Found",
            };
        }
    }

    @Role(['Any'])
    @Mutation(returns => EditProfileOutput) 
    async editProfile(
        @AuthUser() authUser: User, 
        @Args('input') editProfileInput: EditProfileInput
        ): Promise<EditProfileOutput> {
            try {
                await this.usersService.editProfile(authUser.id, editProfileInput);
                return {
                    ok: true
                }
            } catch(error){
                return {
                    ok: false,
                    error
                }
            }
    }

    @Mutation(returns => VerifyEmailOutput) 
    async verifyEmail(@Args('input') {code}: VerifyEmailInput): Promise<VerifyEmailOutput> {
        try {
            await this.usersService.verifyEmail(code);
            return {
                ok :true,
            }
        } catch(error) {
            return {
                ok : false,
                error,
            };
        }
        
    }
}