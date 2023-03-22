const SportEntity = require('../entities/Sport');
const Sport = require('../models/sports');

const getAllSports = async () => {
  const sportsData = await SportEntity.findAllSports();
  return sportsData.map((sport) => sport.label);
};

const findSportByName = async (sportName) => SportEntity.findSportBySportName(sportName);

const addNewSportToDataBase = async (sportName) => {
  const newSport = new Sport({
    label: sportName,
  });

  return newSport.save();
};

module.exports = {
  getAllSports,
  findSportByName,
  addNewSportToDataBase,
};
