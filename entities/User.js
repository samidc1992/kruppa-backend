const User = require('../models/users');

const findUserByUsernameAndEmail = async (username, email) => {
    const user = await User.findOne({ username, email });
    return user;
};

const findUserByEmail = async (email) => {
    const user = User.findOne({ email });
    return user;
};

const updateUserByToken = async (token, gender, photo, birthDate, description, favoriteSports) => {
    const updatedUser = await User.updateOne(
        { token },
        {
            gender,
            photo,
            birthDate,
            description,
            favoriteSports
        }
    );
    return updatedUser;
}

module.exports = {
    findUserByUsernameAndEmail,
    findUserByEmail,
    updateUserByToken,
}