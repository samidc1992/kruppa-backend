const User = require('../models/users');

const findUserByUsernameAndEmail = async (username, email) => {
    const user = await User.findOne({ username, email });
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
}

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

const addUserGroupSubscription = async (token, group_id, status) => {
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

const removeUserGroupSubscription = async (token, group_id) => {
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
    findUserByEmail,
    findUserByToken,
    updateUserByToken,
    findUserByTokenAndGroupId,
    addUserGroupSubscription,
    removeUserGroupSubscription
};