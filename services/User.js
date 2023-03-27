const bcrypt = require('bcryptjs');

const UserEntity = require('../entities/User');

const signup = async (username, email, password) => {
  const existingUserEmail = await UserEntity.findUserByEmail(email);
  const existingUsername = await UserEntity.findUserByUsername(username);

  if (existingUserEmail === null && existingUsername === null) {
    return UserEntity.createUser(username, email, password);
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
