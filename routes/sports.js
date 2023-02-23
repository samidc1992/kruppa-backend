var express = require('express');
var router = express.Router();
const { checkBody } = require('../utils/checkBody');

const SportService = require ('../services/Sport');

router.post('/', async (req, res) => {

    if (!checkBody(req.body, ['label'])) {
        res.json({ result: false, error: 'Missing or empty fields.' });
        return;
    };

    const { label } = req.body;
    const sportName = label[0].toUpperCase() + label.slice(1).toLowerCase();
    const sportData = await SportService.findSportByName(sportName);

    if(sportData === null) {
        const savedSport = await SportService.addNewSportToDataBase(sportName);
        res.json({ result: true, sport: savedSport });
    } else {
        res.json({ result: false, error: 'Sport already exists in database.' });
    };
})

router.get('/', async(req, res) => {

    const sportsNames = await SportService.getAllSports();

    if(sportsNames) {
        res.json({ result: true, sports: sportsNames });
    } else {
        res.json({ result: false, error: 'Sports not found.' });
    };
})

module.exports = router;
