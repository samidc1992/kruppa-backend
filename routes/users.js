var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users');
const Group = require('../models/groups');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcryptjs');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');



router.post('/signup', (req, res) => {

  const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // Check if all fiels are filled out
  if (!checkBody(req.body, ['username', 'email', 'password']) || !EMAIL_REGEX.test(req.body.email)) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  // Check if the user has not already been registered
  User.findOne({ username: req.body.username, email: req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const newUser = new User({
        username: req.body.username,
        gender: null,
        email: req.body.email,
        hash: hash,
        photo: null,
        birthDate: null,
        description: null,
        favoriteSports: [],
        registrations: [],
        token: uid2(32),
      });
      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

//Filling out the rest of user's information
router.put('/signup', (req, res) => {
  // Check if all fiels are filled out
  if (!checkBody(req.body, ['gender', 'birthDate', 'description', 'token'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  const { gender, photo, birthDate, description, favoriteSports, token } = req.body;
  User.updateOne(
    { token: token },
    {
      gender,
      photo,
      birthDate,
      description,
      // $push: { favoriteSports: { sport: req.body.sport, level: req.body.level } }
      favoriteSports
    }
  ).then(() => {
    res.json({ result: true })
  });
});

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: req.body.email })
    .then(data => {
      if (data && bcrypt.compareSync(req.body.password, data.hash)) {
        res.json({
          result: true,
          user: {
            token: data.token,
            username: data.username
          }
        });
      } else {
        res.json({ result: false, error: 'User not found or wrong password' });
      };
    });
});

router.post('/', (req, res) => {
  if (!checkBody(req.body, ['token'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  // find the user which username is req.params
  User.findOne({ username: { $regex: new RegExp(req.params.username, 'i') } }).then(data => {
    res.json({ result: true, user: data });
  });
});

router.put('/join-group', (req, res) => {
  let { token, group_id, status } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(group_id);
  if (!token || !group_id || !isGroupIdValid) {
    res.json({ result: false, message: 'No valid token or group id received.' });
    return;
  };
  User.findOne({
    token,
    'registrations.group': group_id
  }).then(userData => {
    if (userData) {
      res.json({ result: false, message: 'User already joined this group.' })
    } else {
      User.updateOne(
        { token },
        {
          $push: {
            registrations: {
              group: group_id,
              status,
            }
          }
        })
        .then(data => {
          if (data.modifiedCount > 0) {
            res.json({ result: true, message: 'User joined sucessfully.' })
          } else {
            res.json({ result: false, error: 'User cannot join.' })
          }
        }).catch(error => console.log(error));
    }
  })
});

// upload profile picture

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
})

// Retrieves all groups from user
router.post('/groups', (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.json({ result: false, error: 'No token received.' });
    return;
  }

  User.findOne({ token })
    .populate('registrations.group')
    .populate({ //get populate from sub sub document
      path: "registrations.group", // 1st level subdoc
      populate: { // 2nd level subdoc 
        path: "sport",
        select: 'label'
      }
    })
    .then(userData => {
      if (userData) {
        res.json({ result: true, userGroups: userData.registrations, userData })
      } else {
        res.json({ result: false, error: 'No groups found for user' })
      }
    });
});

router.put('/leave-group', (req, res) => {
  let { token, group_id, status } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(group_id);
  if (!token || !group_id || !isGroupIdValid) {
    res.json({ result: false, message: 'No valid token or group id received.' });
    return;
  };

  User.updateOne(
    { token },
    {
      $pull:
      {
        registrations: {
          group: group_id,
          status: 'Approved'
        }
      }
    },
  )
    .then(data => {
      if (data.modifiedCount > 0) {
        res.json({ result: true, message: 'User left sucessfully.' })
      } else {
        res.json({ result: false, error: 'User could not leave the group.' })
      }
    }).catch(error => console.log(error));
});

router.post('/join-status', (req, res) => {
  let { token, group_id } = req.body;
  const isGroupIdValid = mongoose.Types.ObjectId.isValid(group_id);
  if (!token || !group_id || !isGroupIdValid) {
    res.json({ result: false, message: 'No valid token or group id received.' });
    return;
  };
  User.findOne({
    token,
    'registrations.group': group_id
  }).then(userData => {
    if (userData) {
      res.json({ result: false, message: 'User already joined this group.' })
    } else {
      res.json({ result: true, message: 'User not in this group.' })
    }
  })
});


module.exports = router;
