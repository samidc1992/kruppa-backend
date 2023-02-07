const request = require('supertest');
const mongoose = require('mongoose');
const uid2 = require('uid2');
const bcrypt = require('bcryptjs');

const { createApp } = require('../cleanArchApp');

//mocks and replaces user service
jest.mock('../services/User');
const UserService = require('../services/User');
const { disconnection } = require('../models/connection');

describe('/user', () => {
    let app;
    
    beforeAll(async () => {
        app = await createApp();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(async () => {
        await disconnection();
    });

    describe('user registration', () => {

        describe('given that the username, email and password are valid', () => {

            it('should return result as true and user token', async() => {
                const userInput = {
                    username: 'aymeric',
                    email: 'aymeric.secret@kruppa.com',
                    password: 'supermdp',
                };

                const userId = new mongoose.Types.ObjectId().toString();

                const hash = bcrypt.hashSync(userInput.password, 10);

                const UserServiceMockResponse = {
                    _id: userId,
                    username: 'aymeric',
                    email: 'aymeric.secret@kruppa.com',
                    hash,
                    token: uid2(32),
                };

                //mocks return value
                //using mockResolvedValueOnce as it is async otherwise we could use mockReturnValueOnce
                UserService.signup.mockResolvedValueOnce(UserServiceMockResponse);
                
                //expected response from controller /users/signup
                const userSignupControllerResponse = { result: true, token: UserServiceMockResponse.token };

                const {body, statusCode} = await request(app).post('/users/signup').send(userInput);

                expect(statusCode).toBe(200);
                expect(body).toEqual(userSignupControllerResponse);
                expect(UserService.signup).toHaveBeenCalledTimes(1);
            })
        });
        describe('given that username, email or password is null', () => {

            const userSignupControllerResponse = { result: false, error: 'Missing or empty fields.'};

            describe('given that username is null', () => {

                it('should return result as false', async() => {
                    const userInput = {
                        email: 'aymeric.secret@kruppa.com',
                        password: 'supermdp',
                    };
    
                    UserService.signup.mockResolvedValueOnce();

                    const {body, statusCode} = await request(app).post('/users/signup').send(userInput);
    
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(userSignupControllerResponse);
                    expect(UserService.signup).toHaveBeenCalledTimes(0);
                })
            });
            describe('given that email is null', () => {

                it('should return result as false', async() => {
                    const userInput = {
                        username: 'aymeric',
                        password: 'supermdp',
                    };
    
                    UserService.signup.mockResolvedValueOnce();
    
                    const {body, statusCode} = await request(app).post('/users/signup').send(userInput);
    
                    expect(statusCode).toBe(200);
                    expect(body).toEqual(userSignupControllerResponse);
                    expect(UserService.signup).toHaveBeenCalledTimes(0);
                })
            });
            describe('given that password is null', () => {

                it('should return result as false', async() => {
                    const userInput = {
                        username: 'aymeric',
                        email: 'aymeric.secret@kruppa.com',
                    };

                    UserService.signup.mockResolvedValueOnce();

                    const {body, statusCode} = await request(app).post('/users/signup').send(userInput);

                    expect(statusCode).toBe(200);
                    expect(body).toEqual(userSignupControllerResponse);
                    expect(UserService.signup).toHaveBeenCalledTimes(0);
                })
            });
            describe('given that username, email and password are null', () => {

                it('should return result as false', async() => {
                    const userInput = {};

                    UserService.signup.mockResolvedValueOnce();

                    const {body, statusCode} = await request(app).post('/users/signup').send(userInput);

                    expect(statusCode).toBe(200);
                    expect(body).toEqual(userSignupControllerResponse);
                    expect(UserService.signup).toHaveBeenCalledTimes(0);
                })
            });
        })
        describe('given that username or email already exist', () => {

            it('should return result as false', async() => {
                const userInput = {
                    username: 'aymeric',
                    email: 'aymeric.secret@kruppa.com',
                    password: 'supermdp',
                };
                
                const userSignupControllerResponse =  { result: false, error: 'Username or email already exists.' };

                UserService.signup.mockResolvedValueOnce();

                const {body, statusCode} = await request(app).post('/users/signup').send(userInput);

                expect(statusCode).toBe(200);
                expect(body).toEqual(userSignupControllerResponse);
                expect(UserService.signup).toHaveBeenCalledTimes(1);
            })
        });
        describe('given that email is not valid', () => {
            it('should return result as false', async() => {
                const userInput = {
                    username: 'aymeric',
                    email: 'aymeric123#',
                    password: 'supermdp',
                };
                
                const userSignupControllerResponse =  { result: false, error: 'Missing or empty fields.' };

                UserService.signup.mockResolvedValueOnce();

                const {body, statusCode} = await request(app).post('/users/signup').send(userInput);

                expect(statusCode).toBe(200);
                expect(body).toEqual(userSignupControllerResponse);
                expect(UserService.signup).toHaveBeenCalledTimes(0);
            })
        });
    });
    describe('user profile update', () => {
        describe('given that user token is null', () => {
            it('should return result as false', async() => {
                const userInput = {
                    gender: 'Male',
                    photo: 'url-placeholder',
                    birthDate: '1992/10/11',
                    description: 'I swim in the Seine',
                    favoriteSports: [{
                        sport: 'Yoga',
                        level: 'advanced'
                    }],
                };

                const userProfileCompletionControllerResponse =  { result: false, error: 'Missing or empty fields.' };

                //UserService.completeProfile.mockResolvedValueOnce();

                const {body, statusCode} = await request(app).put('/users/signup').send(userInput);

                expect(statusCode).toBe(200);
                expect(body).toEqual(userProfileCompletionControllerResponse);
                expect(UserService.completeProfile).toHaveBeenCalledTimes(0);
            })
        });
        describe('given that user token is not null but at least one mandatory profile field is null', () => {
            it('should return result as false', async() => {
                const input = {
                    gender: 'Male',
                    photo: 'url-placeholder',
                    birthDate: '1992/10/11',
                    description: null,
                    favoriteSports: [{
                        sport: 'Yoga',
                        level: 'advanced'
                    }],
                    token: uid2(32),
                };

                const userProfileCompletionControllerResponse = { result: false, error: 'Missing or empty fields.' };

                // UserService.completeProfile.mockResolvedValueOnce();

                const { body, statusCode } = await request(app).put('/users/signup').send(input);

                expect(statusCode).toBe(200);
                expect(body).toEqual(userProfileCompletionControllerResponse);
                expect(UserService.completeProfile).toHaveBeenCalledTimes(0);
            })
        });
        describe('given that user token and mandatory profile fields are not null', () => {
            it('should return result as true', async() => {
                const input = {
                    gender: 'Male',
                    photo: 'url-placeholder',
                    birthDate: '1992/10/11',
                    description: 'I swim in the Seine',
                    favoriteSports: [{
                        sport: 'Yoga',
                        level: 'advanced'
                    }],
                    token: uid2(32),
                };

                const UserServiceMockResponse = {
                    acknowledged: true,
                    modifiedCount: 1,
                    upsertedId: null,
                    upsertedCount: 0,
                    matchedCount: 1
                };
                
                const userProfileCompletionControllerResponse = { result: true, message: 'Sucessfully updated user.' }

                UserService.completeProfile.mockResolvedValueOnce(UserServiceMockResponse);

                const {body, statusCode} = await request(app).put('/users/signup').send(input);

                expect(statusCode).toBe(200);
                expect(body).toEqual(userProfileCompletionControllerResponse);
                expect(UserService.completeProfile).toHaveBeenCalledTimes(1);
            })
        });
        describe('given that token and madatory fields are not null but the user service enconters an error and returns undefined', () => {
            it('should return false', async() => {
                const input = {
                    gender: 'Male',
                    photo: 'url-placeholder',
                    birthDate: '1992/10/11',
                    description: 'I swim in the Seine',
                    favoriteSports: [{
                        sport: 'Yoga',
                        level: 'advanced'
                    }],
                    token: uid2(32),
                };

                const userProfileCompletionControllerResponse = {result: false, error: 'User token not found.'};

                UserService.completeProfile.mockResolvedValueOnce();

                const { body, statusCode } = await request(app).put('/users/signup').send(input);

                expect(statusCode).toBe(200);
                expect(body).toEqual(userProfileCompletionControllerResponse);
                expect(UserService.completeProfile).toHaveBeenCalledTimes(1);
            })
        })
    })

    // a user can sign in with valid email and password
    // a user can join and leave a group
    // users can create a group
    //
});