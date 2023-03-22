const Sport = require('../models/sports');

const findSportBySportName = async (sport) => Sport.findOne({ label: sport });

const findAllSports = async () => Sport.find();

module.exports = {
  findSportBySportName,
  findAllSports,
};
