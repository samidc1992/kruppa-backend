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

const findGroupById = async(group_id) => {

    const group = await Group.findById(group_id)
    .populate('sport', 'label -_id')
    .populate('admin', 'username -_id');

    return group;
}

const updateGroupById = async(group_id) => {

    const updateInformation = await Group.updateOne(
        { _id: group_id },
        { photo: url }
    );

    return updateInformation
}


module.exports = {
    findGroupBySportAndOrLocation,
    findGroupById,
    updateGroupById,
};