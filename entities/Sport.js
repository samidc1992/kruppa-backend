const Sport = require('../models/sports');

const findSportBySportName = async(sport) => {
    const sportData = await Sport.findOne({ label: sport });
    return sportData;
};

const findAllSports = async() => {
    const sportsData = await Sport.find();
    return sportsData;
};

module.exports = {
    findSportBySportName,
    findAllSports
};