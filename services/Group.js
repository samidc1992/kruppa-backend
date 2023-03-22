const GroupEntity = require('../entities/Group');
const SportEntity = require('../entities/Sport');
const UserEntity = require('../entities/User');

const Group = require('../models/groups');

const createGroup = async (token, photo, name, sportName, maxMembers, genders, levels, ageMin, ageMax, description, label, latitude, longitude, status) => {
  const sportData = await SportEntity.findSportBySportName(sportName);
  const userData = await UserEntity.findUserByToken(token);

  if (!sportData || !userData) {
    return;
  }

  const newGroup = new Group({
    admin: userData._id,
    photo,
    name,
    sport: sportData._id,
    maxMembers,
    genders,
    levels,
    ageMin,
    ageMax,
    description,
    workout_location: {
      label,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    },
  });

  const newGroupData = newGroup.save();

  await UserEntity.addUserToGroup(token, newGroupData._id, status);

  return newGroupData;
};

const searchGroup = async (sport, latitude, longitude) => {
  const sportData = await SportEntity.findSportBySportName(sport);

  if (!sportData) {
    return;
  }

  const groupsData = await GroupEntity.findGroupBySportAndOrLocation(sport, sportData._id, latitude, longitude);

  return groupsData;
};

const getGroupInformation = async (groupId) => GroupEntity.findGroupById(groupId);

const getGroupMembers = async (groupId) => UserEntity.findUsersByGroupId(groupId);

const updateGroupPictureURL = async (groupId, url) => GroupEntity.updateGroupPhotoById(groupId, url);

module.exports = {
  createGroup,
  searchGroup,
  getGroupInformation,
  getGroupMembers,
  updateGroupPictureURL,
};
