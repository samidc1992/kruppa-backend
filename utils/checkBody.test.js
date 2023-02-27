const { checkBody } = require('./checkBody');

it('Should return true', () => {
    const body = {
        username: 'janedoe',
        email: 'janedoe@gmail.com', 
        password: '1234'
    };
    const keys = [ 
        'username',
        'email', 
        'password'
    ];
    const result = checkBody(body, keys);
    expect(result).toBe(true);
});

it('Should return false', () => {
    const body = {
        username: 'janedoe'
    };
    const keys = [
        'username',
        'email',
        'password'
    ];
    const result = checkBody(body, keys);
    expect(result).toBe(false);
});