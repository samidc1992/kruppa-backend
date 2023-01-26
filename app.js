require('dotenv').config();
require('./models/connection');
const mongoose = require('mongoose');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var groupsRouter = require('./routes/groups');
var sportsRouter = require('./routes/sports');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const connectionString = process.env.CONNECTION_STRING;

var app = express();

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

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
        .then(() => console.log('Database connected'))
        .catch(error => console.error(error));

module.exports = app;

