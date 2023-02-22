var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const Group = require('../models/groups');
const GroupService = require('../services/Group');

router.post('/create', async(req, res) => {

    let { token, photo, name, sport, maxMembers, genders, levels, ageMin, ageMax, description, label, latitude, longitude, status } = req.body;

    if (!token || !photo || !name || !sport || !maxMembers || !genders || !levels || !ageMin || !ageMax || !description || !label || !latitude || !longitude) {
        res.json({ result: false, error: 'Missing or empty fields.' });
        return;
    };

    const newGroupData = await GroupService.createGroup(token, photo, name, sport, maxMembers, genders, levels, ageMin, ageMax, description, label, latitude, longitude, status);

    if(newGroupData) {
        res.json({ result: true, message: 'New group created successfully.', data: newGroupData });
    } else {
        res.json({ result: false, error: 'New group could not be created successfully.' });
    }
    
});

router.get('/search', async(req, res) => {

    let { sport, latitude, longitude } = req.query;

    if ((!sport && !latitude && !longitude) || ((latitude || longitude) && (!latitude || !longitude))) {
        res.json({ result: false, error: 'Missing or empty fields.' });
        return;
    }

    const groups = await GroupService.searchGroup(sport, latitude, longitude);

    if(groups) {
        res.json({ result: true, groups }) 
    } else {
        res.json({ result: false, error: 'No groups found for sport and/or location.'})
    }

});

// retrieves group information
router.post('/main', async(req, res) => {
    let { groupId } = req.body;
    const isGroupIdValid = mongoose.Types.ObjectId.isValid(groupId);

    if (!isGroupIdValid) {
        res.json({ result: false, error: 'Missing or invalid group id.' });
        return;
    };

    const groupData = await GroupService.getGroupInformation(groupId);

    if (groupData) {
        res.json({ result: true, groupData })
    } else {
        res.json({ result: false, error: 'No group found for group id.' })
    };

});

// get all members for a given group 
router.post('/members', async(req, res) => {
    let { groupId } = req.body;
    const isGroupIdValid = mongoose.Types.ObjectId.isValid(groupId);

    if (!isGroupIdValid) {
        res.json({ result: false, error: 'Missing or invalid group id.' });
        return;
    };

    const userData = await GroupService.getGroupMembers(groupId);

    if(userData) {
        res.json({ result: true, userData })
    } else {
        res.json({ result: false, error: 'No users found for group id.' })
    };

})

// upload group picture
router.post('/upload', async (req, res) => {

    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.groupPicture.mv(photoPath);

    if (!resultMove) {
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);
        res.json({ result: true, url: resultCloudinary.secure_url });
    } else {
        res.json({ result: false, error: resultMove });
    }
    fs.unlinkSync(photoPath);

});

router.put('/picture', (req, res) => {
    const { groupId, url } = req.body
    Group.updateOne(
        { _id: groupId },
        { photo: url }
    ).then(() => {
        Group.findOne({ _id: groupId }).then(data => {
            res.json({ result: true, photo: data.photo });
        });

    });
});

module.exports = router;
