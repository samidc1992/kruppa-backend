const Group = require('../models/groups');

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
};
