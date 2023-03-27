const User = require('../models/users');

const findUserByUsernameAndEmail = async (username, email) => User.findOne({ username, email });

const findUserByUsername = async (username) => User.findOne({ username });

const findUserByEmail = async (email) => User.findOne({ email });

const findUserByToken = async (token) => User.findOne({ token })
  .populate('registrations.group')
  .populate({ // get populate from sub sub document
    path: 'registrations.group', // 1st level subdoc
    populate: { // 2nd level subdoc
      path: 'sport',
      select: 'label',
    },
  });

const findUsersByGroupId = async (groupId) => User.find({ 'registrations.group': groupId });

const updateUserByToken = async (
  token,
  gender,
  photo,
  birthDate,
  description,
  favoriteSports,
) => User.updateOne(
  { token },
  {
    gender,
    photo,
    birthDate,
    description,
    favoriteSports,
  },
);

const updateUserProfilePictureByToken = async (token, photo) => User.updateOne(
  { token },
  { photo },
);

const findUserByTokenAndGroupId = async (token, groupId) => User.findOne({ token, 'registrations.group': groupId });

const addUserToGroup = async (token, groupId, status) => User.updateOne(
  { token },
  {
    $push: {
      registrations: {
        group: groupId,
        status,
      },
    },
  },
);

const removeUserFromGroup = async (token, groupId) => User.updateOne(
  { token },
  {
    $pull: {
      registrations: {
        group: groupId,
        status: 'Approved',
      },
    },
  },
);

module.exports = {
  findUserByUsernameAndEmail,
  findUserByUsername,
  findUserByEmail,
  findUserByToken,
  findUsersByGroupId,
  updateUserByToken,
  updateUserProfilePictureByToken,
  findUserByTokenAndGroupId,
  addUserToGroup,
  removeUserFromGroup,
};
