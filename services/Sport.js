const SportEntity = require('../entities/Sport');
const Sport = require('../models/sports');

const getAllSports = async() => {
    const sportsData = await SportEntity.findAllSports();
    return sportsData.map(sport => sport.label);
};

const findSportByName = async(sportName) => {
    const sportData = await SportEntity.findSportBySportName(sportName);
    return sportData;
};

const addNewSportToDataBase = async(sportName) => {
    const newSport = new Sport({
        label: sportName
    });

    const savedSportData = await newSport.save();

    return savedSportData;
}

module.exports = {
    getAllSports,
    findSportByName,
    addNewSportToDataBase
}