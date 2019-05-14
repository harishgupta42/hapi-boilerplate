const config = require('config');
const boom = require('boom');
const hapiNowAuth = require('@now-ims/hapi-now-auth');

const models = require('../models');
const { logger } = require('../lib/logger');
const constants = require('../config/constants');

exports.plugin = {
  name: 'auth',
  register: async (server, options) => {
    await server.register(hapiNowAuth);

    server.auth.strategy('jwt-strategy', 'hapi-now-auth', {
      verifyJWT: true,
      keychain: [config.get('secretKey')],
      validate: async (request, token, h) => {
        /**
         * we asked the plugin to verify the JWT
         * we will get back the decodedJWT as token.decodedJWT
         * and we will get the JWT as token.token
         */

        const decoded = token.decodedJWT;
        logger.trace({ USERINFO: decoded });
        /**
         * return the decodedJWT to take advantage of hapi's
         * route authentication options
         * https://hapijs.com/api#authentication-options
         */
        const filters = {
          _id: decoded.id,
        };
        const user = await models.userModel.findOne(filters);
        if (!user) {
          throw boom.unauthorized('User not found');
        }
        if (user.isBlocked === true) {
          throw boom.unauthorized('Your account is blocked');
        }
        const sessionFilter = {
          userId: user._id,
          loginTimestamp: {
            $eq: new Date(decoded.date),
          },
          status: constants.sessionStatus.LOGGED_IN,
        };
        if (decoded.deviceToken && decoded.deviceType) {
          sessionFilter.deviceToken = decoded.deviceToken;
          sessionFilter.deviceType = decoded.deviceType;
        }
        const session = await models.sessionModel.findOne(sessionFilter);
        if (!session) {
          throw boom.unauthorized('Session Expired. Please login again to continue');
        }
        // let credentials = { _id: user._id, deviceToken: decoded.deviceToken, deviceType: decoded.deviceType, scope: decoded.scope };
        // let isValid = true;
        return {
          isValid: true,
          credentials: {
            _id: user._id,
            deviceToken: decoded.deviceToken,
            deviceType: decoded.deviceType,
            scope: decoded.scope,
            date: decoded.date,
          },
        };
      },
    });
    server.auth.default('jwt-strategy');
  },
};
