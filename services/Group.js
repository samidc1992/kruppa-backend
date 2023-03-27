const GroupEntity = require('../entities/Group');
const SportEntity = require('../entities/Sport');
const UserEntity = require('../entities/User');

const createGroup = async (
  token,
  photo,
  name,
  sportName,
  maxMembers,
  genders,
  levels,
  ageMin,
  ageMax,
  description,
  label,
  latitude,
  longitude,
  status,
) => {
  try {
    const userData = await UserEntity.findUserByToken(token);
    const sportData = await SportEntity.findSportBySportName(sportName);

    if (!sportData || !userData) {
      return;
    }

    const newGroupData = await GroupEntity.createGroup(
      // eslint-disable-next-line
      userData._id,
      photo,
      name,
      // eslint-disable-next-line
      sportData._id,
      maxMembers,
      genders,
      levels,
      ageMin,
      ageMax,
      description,
      label,
      latitude,
      longitude,
    );

    // eslint-disable-next-line
    await UserEntity.addUserToGroup(token, newGroupData._id, status);

    return newGroupData;
  } catch (error) {
    console.log('[services/Group.createGroup] Error', error);
    throw error;
  }
};

const searchGroup = async (sport, latitude, longitude) => {
  const sportData = await SportEntity.findSportBySportName(sport);

  if (!sportData) {
    return;
  }

  const groupsData = await GroupEntity.findGroupBySportAndOrLocation(
    sport,
    // eslint-disable-next-line
    sportData._id,
    latitude,
    longitude,
  );

  return groupsData;
};

const getGroupInformation = async (groupId) => GroupEntity.findGroupById(groupId);

const getGroupMembers = async (groupId) => UserEntity.findUsersByGroupId(groupId);

const updateGroupPictureURL = async (groupId, url) => {
  GroupEntity.updateGroupPhotoById(groupId, url);
};

module.exports = {
  createGroup,
  searchGroup,
  getGroupInformation,
  getGroupMembers,
  updateGroupPictureURL,
};
