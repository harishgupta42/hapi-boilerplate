const hapiSwagger = require('hapi-swagger');
const inert = require('inert');
const vision = require('vision');
const config = require('config');

const { logger } = require('../lib/logger');

exports.plugin = {
  name: 'swagger-plugin',
  register: async (server, options) => {
    await server.register([
      inert,
      vision,
      {
        plugin: hapiSwagger,
        options: {
          info: {
            title: config.get('appName'),
            description:
              'Powered by node, hapi, joi, hapi-swaggered, hapi-swaggered-ui and swagger-ui',
            version: '1.0',
          },
          grouping: 'tags',
          payloadType: 'form',
          cors: true,
        },
      },
    ]);
    logger.trace('Swagger Loaded');
  },
};
