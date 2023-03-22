const mongoose = require('mongoose');

const connectionString = process.env.CONNECTION_STRING;

const connection = async () => {
  await mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
    .then(() => console.log('Database connected'))
    .catch((error) => console.error(error));
};

const disconnection = async () => {
  await mongoose.disconnect()
    .then(() => console.log('Database disconnected'))
    .catch((error) => console.error(error));
};

module.exports = { connection, disconnection };
