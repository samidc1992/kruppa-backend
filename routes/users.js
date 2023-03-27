const express = require('express');
const mongoose = require('mongoose');

const UserService = require('../services/User');
const { checkBody } = require('../utils/checkBody');
const { uploadPictureToCloudinary } = require('../utils/uploadPictureToCloud');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  // eslint-disable-next-line
  const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!checkBody(req.body, ['username', 'email', 'password']) || !EMAIL_REGEX.test(req.body.email)) {
    res.json({ result: false, error: 'Missing or empty fields.' });
    return;
  }

  const insertedUser = await UserService.signup(username, email, password);

  if (insertedUser) {
    res.json({ result: true, token: insertedUser.token });
    return;
  }

  res.json({ result: false, error: 'Username or email already exists.' });
});

router.put('/signup', async (req, res) => {
  const {
    gender, photo, birthDate, description, favoriteSports, token,
  } = req.body;

  if (!checkBody(req.body, ['gender', 'birthDate', 'description', 'token'])) {
    res.json({ result: false, error: 'Missing or empty fields.' });
    return;
  }

  const updatedUser = await UserService.completeProfile(
    token,
    gender,
    photo,
    birthDate,
    description,
    favoriteSports,
  );

  if (updatedUser && updatedUser.modifiedCount > 0) {
    res.json({ result: true, message: 'Sucessfully updated user.' });
    return;
  }

  res.json({ result: false, error: 'User token not found.' });
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  // eslint-disable-next-line
  const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!checkBody(req.body, ['email', 'password']) || !EMAIL_REGEX.test(req.body.email)) {
    res.json({ result: false, error: 'Missing or empty fields.' });
    return;
  }

  const user = await UserService.signin(email, password);

  if (user) {
    res.json({ result: true, user: { token: user.token, username: user.username } });
    return;
  }

  res.json({ result: false, error: 'Invalid email or password.' });
});

router.put('/join-group', async (req, res) => {
  const { token, groupId, status } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(groupId);

  if (!token || !groupId || !isGroupIdValid) {
    res.json({ result: false, message: 'Invalid token or group id.' });
    return;
  }

  const updateInformation = await UserService.joinGroup(token, groupId, status);

  if (updateInformation) {
    res.json({ result: true, message: 'User joined sucessfully.' });
    return;
  }

  res.json({ result: false, error: 'User already joined this group.' });
});

router.put('/leave-group', async (req, res) => {
  const { token, groupId } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(groupId);

  if (!token || !groupId || !isGroupIdValid) {
    res.json({ result: false, message: 'Invalid token or group id received.' });
    return;
  }

  const updateInformation = await UserService.leaveGroup(token, groupId);

  if (updateInformation) {
    res.json({ result: true, message: 'User left sucessfully.' });
    return;
  }

  res.json({ result: false, error: 'User was not subscribed to the group.' });
});

router.post('/groups', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.json({ result: false, error: 'No token received.' });
    return;
  }

  const user = await UserService.getUserGroupsInformation(token);

  if (user) {
    res.json({ result: true, userGroups: user.registrations, user });
    return;
  }

  res.json({ result: false, error: 'User not found.' });
});

router.post('/join-status', async (req, res) => {
  const { token, groupId } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(groupId);

  if (!token || !groupId || !isGroupIdValid) {
    res.json({ result: false, message: 'Invalid token or group id received.' });
    return;
  }

  const user = await UserService.getUserGroupStatus(token, groupId);

  if (user) {
    res.json({ result: false, message: 'User already joined this group.' });
    return;
  }

  res.json({ result: true, message: 'User not in this group.' });
});

router.post('/upload', async (req, res) => {
  const { files } = req;

  if (!files) {
    res.json({ result: false, error: 'No files received.' });
  }

  const resultCloudinary = await uploadPictureToCloudinary(files.profilePicture);

  if (resultCloudinary) {
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultCloudinary });
  }
});

router.put('/picture', async (req, res) => {
  const { token, url } = req.body;
  const updateInformation = await UserService.addProfilePicture(token, url);

  if (updateInformation.modifiedCount > 0) {
    res.json({ result: true, photo: url });
  } else {
    res.json({ result: false, error: 'Profile picture could not be updated sucessfully.' });
  }
});

module.exports = router;
