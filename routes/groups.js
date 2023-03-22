const express = require('express');
const mongoose = require('mongoose');

const GroupService = require('../services/Group');
const { uploadPictureToCloudinary } = require('../utils/uploadPictureToCloud');

const router = express.Router();

router.post('/create', async (req, res) => {
  const {
    token, photo, name, sport, maxMembers, genders, levels, ageMin, ageMax, description, label, latitude, longitude, status,
  } = req.body;

  if (!token || !photo || !name || !sport || !maxMembers || !genders || !levels || !ageMin || !ageMax || !description || !label || !latitude || !longitude) {
    res.json({ result: false, error: 'Missing or empty fields.' });
    return;
  }

  const newGroupData = await GroupService.createGroup(token, photo, name, sport, maxMembers, genders, levels, ageMin, ageMax, description, label, latitude, longitude, status);

  if (newGroupData) {
    res.json({ result: true, message: 'New group created successfully.', data: newGroupData });
  } else {
    res.json({ result: false, error: 'New group could not be created successfully.' });
  }
});

router.get('/search', async (req, res) => {
  const { sport, latitude, longitude } = req.query;

  if ((!sport && !latitude && !longitude) || ((latitude || longitude) && (!latitude || !longitude))) {
    res.json({ result: false, error: 'Missing or empty fields.' });
    return;
  }

  const groups = await GroupService.searchGroup(sport, latitude, longitude);

  if (groups) {
    res.json({ result: true, groups });
  } else {
    res.json({ result: false, error: 'No groups found for sport and/or location.' });
  }
});

// retrieves group information
router.post('/main', async (req, res) => {
  const { groupId } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(groupId);

  if (!isGroupIdValid) {
    res.json({ result: false, error: 'Missing or invalid group id.' });
    return;
  }

  const groupData = await GroupService.getGroupInformation(groupId);

  if (groupData) {
    res.json({ result: true, groupData });
  } else {
    res.json({ result: false, error: 'No group found for group id.' });
  }
});

// get all members for a given group
router.post('/members', async (req, res) => {
  const { groupId } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(groupId);

  if (!isGroupIdValid) {
    res.json({ result: false, error: 'Missing or invalid group id.' });
    return;
  }

  const usersData = await GroupService.getGroupMembers(groupId);

  if (usersData) {
    res.json({ result: true, usersData });
  } else {
    res.json({ result: false, error: 'No users found for group id.' });
  }
});

// upload group picture
router.post('/upload', async (req, res) => {
  const { files } = req;

  if (!files) {
    res.json({ result: false, error: 'No files received.' });
  }

  const resultCloudinary = await uploadPictureToCloudinary(files.groupPicture);

  if (resultCloudinary) {
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }
});

module.exports = router;
