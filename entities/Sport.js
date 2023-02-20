const Sport = require('../models/sports');

const findSportBySportName = async(sport) => {

    const sportData = await Sport.findOne({ label: sport });
    return sportData;
};

module.exports = {
    findSportBySportName,
};