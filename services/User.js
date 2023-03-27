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
      hash,
      photo: null,
      birthDate: null,
      description: null,
      favoriteSports: [],
      registrations: [],
      token: uid2(32),
    });

    const savedUser = await newUser.save();
    return savedUser;
  }
};

const signin = async (email, password) => {
  const user = await UserEntity.findUserByEmail(email);

  if (user && bcrypt.compareSync(password, user.hash)) {
    return user;
  }
};

const completeProfile = async (
  token,
  gender,
  photo,
  birthDate,
  description,
  favoriteSports,
) => UserEntity.updateUserByToken(token, gender, photo, birthDate, description, favoriteSports);

const joinGroup = async (token, groupId, status) => {
  const userData = await UserEntity.findUserByTokenAndGroupId(token, groupId);

  if (!userData) {
    return UserEntity.addUserToGroup(token, groupId, status);
  }
};

const leaveGroup = async (token, groupId) => {
  const userData = await UserEntity.findUserByTokenAndGroupId(token, groupId);

  if (userData) {
    return UserEntity.removeUserFromGroup(token, groupId);
  }
};

const getUserGroupsInformation = async (token) => UserEntity.findUserByToken(token);

const getUserGroupStatus = async (token, groupId) => {
  UserEntity.findUserByTokenAndGroupId(token, groupId);
};

const addProfilePicture = async (token, photo) => {
  UserEntity.updateUserProfilePictureByToken(token, photo);
};

module.exports = {
  signup,
  signin,
  completeProfile,
  joinGroup,
  leaveGroup,
  getUserGroupsInformation,
  getUserGroupStatus,
  addProfilePicture,
};
