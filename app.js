require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cors = require('cors');
const fileUpload = require('express-fileupload');
const usersRouter = require('./routes/users');
const groupsRouter = require('./routes/groups');
const sportsRouter = require('./routes/sports');
const { connection } = require('./models/connection');

const createApp = async () => {
  const app = express();
  await connection();

  app.use(cors());

  app.use(fileUpload());

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/users', usersRouter);
  app.use('/groups', groupsRouter);
  app.use('/sports', sportsRouter);

  return app;
};

module.exports = { createApp };
