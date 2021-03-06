import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/ceate-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "../jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    async createAccount({email, password, role}: CreateAccountInput): Promise<[boolean, string?]>{
        // check new user & create user
        try {
            const exsists = await this.users.findOne({email});
            if (exsists){
                // throw(make) error
                return [false, "There is a  user with that email already"];
            }
            const user = await this.users.save(this.users.create({email, password, role}));
            const verification = await this.verifications.save(this.verifications.create({
                user,
            })
            );
            this.mailService.sendVerificationEmail(user.email, verification.code);
            return [true];
        } catch(e){
            // throw(make) error
            return [false, "Couldn't create account"];
        }
        // hash the password
    }

    async login({email, password}: LoginInput): Promise<{ ok: boolean; error?: string, token?: string}> {
        // find the user with the email
        // check if the password is correct
        // make a JWT and give it to the user
        try {
            const user = await this.users.findOne({ email }, {select:['password', 'id']});
            if (!user){
                return {
                    ok: false,
                    error: "User not found",
                };
            }
            const passwordCorrect = await user.checkPassword(password);
            if (!passwordCorrect) {
                return {
                    ok: false,
                    error: "Wrong password",
                };
            } 
            const token = this.jwtService.sign(user.id);
            return {
                ok: true,
                token,
            };
        } catch(error) {
            return {
                ok: false,
                error,
            };
        }

    }

    async findById(id: number): Promise<User> {
        return this.users.findOne({id});
    }

    async editProfile(userId: number, {email, password}: EditProfileInput
        ): Promise<User> {
        const user = await this.users.findOne(userId);
        if (email) {
            user.email = email;
            user.verified = false;
            await this.verifications.delete({user: {id:user.id}});
            const verification = await this.verifications.save(this.verifications.create({user}));
            this.mailService.sendVerificationEmail(user.email, verification.code);
        }
        if (password) {
            user.password = password
        }
        return this.users.save(user);
    }

    async verifyEmail(code: string): Promise<boolean> {
        try {
            const verification = await this.verifications.findOne(
                {code},
                {relations: ['user']}
            );
            if(verification){
                verification.user.verified = true;
                this.users.save(verification.user);
                await this.verifications.delete(verification.id);
                return true;
            }
            return false;
        } catch(e) {
            console.log(e);
            return false;
        }

    }
}