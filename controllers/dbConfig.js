'user strict';

const mongoose = require('mongoose');
const config = require('config');
const { logger } = require('../lib/logger');

mongoose.Promise = Promise;

const uri = config.get('mongoDb.uri'); // get MongoDb URI from .json
const options = {
  useNewUrlParser: true,
};
if (config.get('mongoDb.username').length > 0 && config.get('mongoDb.password').length > 0) {
  options.auth = {
    user: config.get('mongoDb.username'),
    password: config.get('mongoDb.password'),
  };
}
// Connect to MongoDB
exports.connection = mongoose
  .connect(uri, options)
  .then((success) => {
    mongoose.set('debug', true);
    logger.info('MongoDB Connected');
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
