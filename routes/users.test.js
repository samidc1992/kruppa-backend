const request = require('supertest');
const { createApp } = require('../app');

describe('/user', () => {
    let app;
    beforeAll(async () => {
        app = await createApp();
    });
    it('Should POST username, email and password and return true', async() => {
        const user = {
            username: 'aymeric',
            email: 'aymeric.secret@kruppa.com',
            password: 'supermdp',
        };
        const result = await request(app).post('/users/signup').send(user);
        expect(result.statusCode).toBe(200);
        expect(result.body.result).toBe(true);
    });
});