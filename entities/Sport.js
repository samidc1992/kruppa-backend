const Sport = require('../models/sports');

const findSportBySportName = async(sport) => {
    return Sport.findOne({ label: sport });
};

const findAllSports = async() => {
    return Sport.find();
};

module.exports = {
    findSportBySportName,
    findAllSports
};