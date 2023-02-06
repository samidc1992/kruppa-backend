const bcrypt = require('bcryptjs');
const uid2 = require('uid2');

const UserEntity = require('../entities/User');
const User = require('../models/users');

const signup = async (username, email, password) => {

    const existingUserEmail = await UserEntity.findUserByEmail(email);
    const existingUsername = await UserEntity.findUserByUsername(username);
 
    if (existingUserEmail === null && existingUsername === null) {
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
    
    if (user && bcrypt.compareSync(password, user.hash)) {
        return user;
    };
};

const completeProfile = async (token, gender, photo, birthDate, description, favoriteSports) => {

    const updatedUser = await UserEntity.updateUserByToken(token, gender, photo, birthDate, description, favoriteSports);
    return updatedUser;
};

const joinGroup = async (token, group_id, status) => {

    const userData = await UserEntity.findUserByTokenAndGroupId(token, group_id);

    if (!userData) {
        const joinGroupUpdateInformation = await UserEntity.addUserGroupSubscription(token, group_id, status);
        return joinGroupUpdateInformation;
    };
};

const leaveGroup = async (token, group_id) => {

    const userData = await UserEntity.findUserByTokenAndGroupId(token, group_id);

    if (userData) {
        const joinGroupUpdateInformation = await UserEntity.removeUserGroupSubscription(token, group_id);
        return joinGroupUpdateInformation;
    };
};

const getUserGroupsInformation = async (token) => {
    const user = await UserEntity.findUserByToken(token);
    return user;
};

const getUserGroupStatus = async (token, group_id) => {
    const user = await UserEntity.findUserByTokenAndGroupId(token, group_id);
    return user;
}

module.exports = {
    signup,
    signin,
    completeProfile,
    joinGroup,
    leaveGroup,
    getUserGroupsInformation,
    getUserGroupStatus
};