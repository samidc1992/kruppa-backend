const User = require('../models/users');

const findUserByUsernameAndEmail = async (username, email) => {
  const user = await User.findOne({ username, email });
  return user;
};

const findUserByUsername = async (username) => {
  const user = await User.findOne({ username });
  return user;
};

const findUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const findUserByToken = async (token) => {
  const user = await User.findOne({ token })
  .populate('registrations.group')
  .populate({ //get populate from sub sub document
    path: "registrations.group", // 1st level subdoc
    populate: { // 2nd level subdoc 
      path: "sport",
      select: "label"
    }
  });
  return user;
};

const findUsersByGroupId = async(group_id) => {
  const usersData = await User.find({ 'registrations.group': group_id });
  return usersData;
};

const updateUserByToken = async (token, gender, photo, birthDate, description, favoriteSports) => {
  const updatedUser = await User.updateOne(
      { token },
      {
          gender,
          photo,
          birthDate,
          description,
          favoriteSports,
      }
  );
  return updatedUser;
};

const findUserByTokenAndGroupId = async (token, group_id) => {
  const user = await User.findOne({ token, 'registrations.group': group_id });
  return user;
};

const addUserToGroup = async (token, group_id, status) => {
  const user = await User.updateOne(
      { token },
      {
        $push: {
          registrations: {
            group: group_id,
            status,
          }
        }
      }
  );
  return user;
};

const removeUserFromGroup = async (token, group_id) => {
  const user = await User.updateOne(
      { token },
      {
        $pull: {
          registrations: {
            group: group_id,
            status: "Approved",
          }
        }
      }
  );
  return user;
};


module.exports = {
    findUserByUsernameAndEmail,
    findUserByUsername,
    findUserByEmail,
    findUserByToken,
    findUsersByGroupId,
    updateUserByToken,
    findUserByTokenAndGroupId,
    addUserToGroup,
    removeUserFromGroup,
};