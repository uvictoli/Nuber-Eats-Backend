//`
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';

jest.mock("got", () => {
  return {
    post: jest.fn()
  };
})

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: "nico@kas.com",
  password: "12345"
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationsRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification));
    await app.init();
  });

  afterAll(async() => {
    await getConnection().dropDatabase()
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `mitation {
          createAccount(input: {
            email: "${testUser.email}",
            password: "${testUser.password}",
            role: Owner
          }) {
            ok
            error
          }
        }`
      })
      .expect(200)
      //.expect(400)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(true);
        expect(res.body.data.createAccount.error).toBe(null);
      });
    });
    it('should fail if account already exists', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `mitation {
          createAccount(input: {
            email: "${testUser.email}",
            password: "${testUser.password}",
            role: Owner
          }) {
            ok
            error
          }
        }`
      })
      .expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(false);
        expect(res.body.data.createAccount.error).toBe(
          'There is a user with that email already',
        );
      });
    });
  });

  describe('login', () => {
    it("should login with correct credentials", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `{
          mutation {
            login(input:{
              email: "${testUser.email}",
              password: "${testUser.password}",
            }) {
              ok
              error
              token
            }
          }
        }`
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: { login },
          },
        } = res;
        expect(login.ok).toBe(true);
        expect(login.error).toBe(null);
        expect(login.token).toEqual(expect.any(String));
        jwtToken = login.token;
      });
    });
    it("should not be able to login with wrong credentials", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `{
          mutation {
            login(input:{
              email: "${testUser.email}",
              password: "xxx",
            }) {
              ok
              error
              token
            }
          }
        }`
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: { login },
          },
        } = res;
        expect(login.ok).toBe(false);
        expect(login.error).toBe("Wrong Password");
        expect(login.token).toBe(null);

      });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it("should see a user's profile", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .set("X-JWT", jwtToken)
      .send({
        query: `
        {
          userProfile(userId:${userId}){
            ok
            error
            user {
              id
            }
          }
        }
        `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              userProfile: {
                ok,
                error,
                user: { id },
              },
            },
          },
        } = res;
        expect(ok).toBe(true);
        expect(error).toBe(null);
        expect(id).toBe(userId);
      })
    })
    it("should not find a profile", ()=> {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .set("X-JWT", jwtToken)
      .send({
        query: `
        {
          userProfile(userId:$666){
            ok
            error
            user {
              id
            }
          }
        }
        `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              userProfile: {
                ok,
                error,
                user,
              },
            },
          },
        } = res;
        expect(ok).toBe(false);
        expect(error).toBe("User Not Found");
        expect(user).toBe(null);
      })
    });
  });

  describe('me', () => {
    it("should find my profile", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .set("X-JWT", jwtToken)
      .send({
        query: `
        {
          me {
            email
          }
        }
        `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              me: { email },
            },
          },
        } = res;
        expect(email).toBe(testUser.email);
      });
    });
    it("should not allow loggen out user", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        {
          me {
            email
          }
        }
        `,
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            errors, 
          },
        } = res;
        const [error] = errors;
        expect(error.message).toBe("Forbidden resource");
      });
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = "nico@new.com";
    it("should change email", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .set('X-JWT', jwtToken)
      .send({
        query: `
        mutation {
          editProfile(input: {
            email: "${NEW_EMAIL}",
          }) {
            ok
            error
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data : {
              editProfile: {ok, error},
            }
          }
        } = res;
        expect(ok).toBe(true);
        expect(error).toBe(null);
      })
      
    });
    it("should have new email", () => {
        return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
        .set("X-JWT", jwtToken)
        .send({
          query: `
          {
            me {
              email
            }
          }
          `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCocde: string;
    beforeAll(async() => {
      const [verification] = await verificationsRepository.find();
      verificationCocde = verification.code;
    });
    it("should verify email", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutaion {
          verifyEmail(input: {
            code: "${verificationCocde}"
          }) {
            ok
            error
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              veriftEmail: {ok, error},
            },
          },
        } = res;
        expect(ok).toBe(true);
        expect(error).toBe(null);
      });
    });
    it("should fail on verification code not found", () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutaion {
          verifyEmail(input: {
            code: "XXXXX"
          }) {
            ok
            error
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              veriftEmail: {ok, error},
            },
          },
        } = res;
        expect(ok).toBe(false);
        expect(error).toBe("Verification not found");
      });
    });
  });
});
