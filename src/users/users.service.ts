import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import { CreateAccountInput } from "./dtos/ceate-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        private readonly jwtService: JwtService,

    ) {}

    async createAccount({email, password, role}: CreateAccountInput): Promise<[boolean, string?]>{
        // check new user & create user
        try {
            const exsists = await this.users.findOne({email});
            if (exsists){
                // throw(make) error
                return [false, "There is a  user with that email already"];
            }
            await this.users.save(this.users.create({email, password, role}));
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
            const user = await this.users.findOne({ email });
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
}