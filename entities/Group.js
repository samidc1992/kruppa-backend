const Group = require('../models/groups');

const findGroupBySportAndOrLocation = async(sportName, sportId, latitude, longitude) => {

    const groups = await Group.find({
        ...(sportName && { sport: sportId }),
        ...((latitude && longitude) && {
            "workout_location.location": {
                $geoWithin: {
                    $centerSphere: [[Number(longitude), Number(latitude)],
                    10 / 6378.1] //create a file with all consts
                }
            }
        })
    })
        .populate('sport');

    return groups;
};

const findGroupById = async(groupId) => {

    const group = await Group.findById(groupId)
    .populate('sport', 'label -_id')
    .populate('admin', 'username -_id');

    return group;
}

const updateGroupPhotoById = async(groupId, url) => {

    const updateInformation = await Group.updateOne(
        { _id: groupId },
        { photo: url }
    );

    return updateInformation;
}


module.exports = {
    findGroupBySportAndOrLocation,
    findGroupById,
    updateGroupPhotoById,
};