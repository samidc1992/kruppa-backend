require('dotenv').config();

const { connection } = require('./models/connection');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var groupsRouter = require('./routes/groups');
var sportsRouter = require('./routes/sports');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const createApp = async () => {  
    var app = express();
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
}

module.exports = { createApp };
