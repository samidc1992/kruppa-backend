const Group = require('../models/groups');

const createGroup = async (
  adminID,
  photo,
  name,
  sportID,
  maxMembers,
  genders,
  levels,
  ageMin,
  ageMax,
  description,
  label,
  latitude,
  longitude,
) => {
  const newGroup = new Group({
    admin: adminID,
    photo,
    name,
    sport: sportID,
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

  return newGroup.save();
};

const findGroupBySportAndOrLocation = async (
  sportName,
  sportId,
  latitude,
  longitude,
) => Group.find({
  ...(sportName && { sport: sportId }),
  ...((latitude && longitude) && {
    'workout_location.location': {
      $geoWithin: {
        $centerSphere: [[Number(longitude), Number(latitude)],
          10 / 6378.1], // create a file with all consts
      },
    },
  }),
})
  .populate('sport');

const findGroupById = async (groupId) => Group.findById(groupId)
  .populate('sport', 'label -_id')
  .populate('admin', 'username -_id');

const updateGroupPhotoById = async (groupId, url) => Group.updateOne(
  { _id: groupId },
  { photo: url },
);

module.exports = {
  findGroupBySportAndOrLocation,
  findGroupById,
  updateGroupPhotoById,
  createGroup,
};
