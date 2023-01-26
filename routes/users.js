var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const User = require('../models/users');
const UserService = require('../services/User');
const { checkBody } = require('../modules/checkBody');

router.post('/signup', async (req, res) => {

  const { username, email, password } = req.body;
  const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  if (!checkBody(req.body, ['username', 'email', 'password']) || !EMAIL_REGEX.test(req.body.email)) {
    res.json({ result: false, error: 'Missing or empty fields.' });
    return;
  };

  const insertedUser = await UserService.signup(username, email, password);

  if (insertedUser) {
    res.json({ result: true, token: insertedUser.token });
    return;
  };

  res.json({ result: false, error: 'User already exists.' });

});


router.put('/signup', async (req, res) => {

  const { gender, photo, birthDate, description, favoriteSports, token } = req.body;

  if (!checkBody(req.body, ['gender', 'birthDate', 'description', 'token'])) {
    res.json({ result: false, error: 'Missing or empty fields.' });
    return;
  };

  const updatedUser = await UserService.completeProfile(token, gender, photo, birthDate, description, favoriteSports);

  if(updatedUser.modifiedCount > 0) {
    res.json({ result: true, message: 'Sucessfully updated user.' });
    return
  }

  res.json({result: false, error: 'User token not found or no changes done by the user.'})

});

router.post('/signin', async (req, res) => {

  const { email, password } = req.body;

  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields.' });
    return;
  };

  const user = await UserService.signin(email, password);

  if (user) {
    res.json({ result: true, user: { token: user.token, username: user.username } });
    return;
  } 

  res.json({ result: false, error: 'User does not exist or incorrect password.' });

});

router.put('/join-group', async (req, res) => {

  const { token, group_id, status } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(group_id);

  if (!token || !group_id || !isGroupIdValid) {
    res.json({ result: false, message: 'Invalid token or group id.' });
    return;
  };

  const updateInformation = await UserService.joinGroup(token, group_id, status);

  if (updateInformation) {
    res.json({ result: true, message: 'User joined sucessfully.' });
    return;
  };

  res.json({ result: false, error: 'User already joined this group.' });
});

router.put('/leave-group', async (req, res) => {

  const { token, group_id } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(group_id);

  if (!token || !group_id || !isGroupIdValid) {
    res.json({ result: false, message: 'Invalid token or group id received.' });
    return;
  };

  const updateInformation = await UserService.leaveGroup(token, group_id);
  
  if (updateInformation) {
    res.json({ result: true, message: 'User left sucessfully.' });
    return;
  }

  res.json({ result: false, error: 'User was not in the group.' });
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

  res.json({ result: false, error: 'Invalid token.' });
});

router.post('/join-status', async (req, res) => {
  const { token, group_id } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(group_id);

  if (!token || !group_id || !isGroupIdValid) {
    res.json({ result: false, message: 'Invalid token or group id received.' });
    return;
  };

  const user = await UserService.getUserGroupStatus(token, group_id);
  console.log(user)
  if (user) {
    res.json({ result: false, message: 'User already joined this group.' });
    return;
  }

  res.json({ result: true, message: 'User not in this group.' })
});

router.post('/upload', async (req, res) => {

  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.profilePicture.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }
  fs.unlinkSync(photoPath);

});

router.put('/picture', (req, res) => {
  const { token, url } = req.body
  User.updateOne(
    { token: token },
    { photo: url }
  ).then(() => {
    User.findOne({ token: token }).then(data => {
      res.json({ result: true, photo: data.photo });
    });

  });
});


module.exports = router;
