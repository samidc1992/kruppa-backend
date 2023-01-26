const bcrypt = require('bcryptjs');
const uid2 = require('uid2');

const UserEntity = require('../entities/User');
const User = require('../models/users');

const signup = async (username, email, password) => {

    const existingUser = await UserEntity.findUserByUsernameAndEmail(username, email);
 
    if (existingUser === null) {
        const hash = bcrypt.hashSync(password, 10);
        const newUser = new User({
            username,
            gender: null,
            email,
            hash: hash,
            photo: null,
            birthDate: null,
            description: null,
            favoriteSports: [],
            registrations: [],
            token: uid2(32),
        });

        const savedUser = await newUser.save();

        return savedUser;
    };
};

const signin = async (email, password) => {

    const user = await UserEntity.findUserByEmail(email);
    
    if (user && bcrypt.compareSync(password, existingUser.hash)) {
        return user;
    } ;
};

const completeProfile = async (token, gender, photo, birthDate, description, favoriteSports) => {
    const updatedUser = await UserEntity.updateUserByToken(token, gender, photo, birthDate, description, favoriteSports);
    return updatedUser;
}

module.exports = {
    signup,
    signin,
    completeProfile
}