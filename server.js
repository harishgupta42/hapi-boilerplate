if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
  console.log(`
    Please specify one of the following environments to run your server
      - development
      - production
      
  Example : NODE_ENV=development pm2 start server.js`);
  process.exit(1);
}

// Node Modules
const Hapi = require('hapi');
const config = require('config');
const path = require('path');

// Importing routes, controllers, plugins, etc.
const routes = require('./routes');
const plugins = require('./plugins');
const { logger } = require('./lib/logger');

process.env.NODE_CONFIG_DIR = path.join(__dirname, './config');
const server = new Hapi.Server({
  app: {
    name: config.get('appName'),
  },
  port: config.get('port'),
  routes: {
    cors: {
      origin: ['*'],
    },
  },
});
global.server = server;
(async (initServer) => {
  // Register plugins
  await server.register(plugins);
  // API Routes
  await server.route(routes);
  server.route({
    method: 'GET',
    path: '/ping',
    handler: (request, h) => ({
      pong: true,
    }),
    config: {
      auth: false,
    },
  });
  try {
    await server.start();
  } catch (error) {
    process.exit(1);
  }
  server.events.on('response', (request) => {
    logger.trace(
      `[${request.method.toUpperCase()} ${request.url.path} ${JSON.stringify(request.payload)}] : ${
        request.response.statusCode
      }`,
    );
  });
  // for swagger host issue
  server.ext('onRequest', async (request, h) => {
    request.headers['x-forwarded-host'] = request.headers['x-forwarded-host'] || request.info.host;
    return h.continue;
  });
  logger.info(`Server running at ${server.info.uri}`);
  process.on('unhandledRejection', (error) => {
    logger.error(error);
  });
  process.on('uncaughtException', (error) => {
    logger.error(error);
  });
})();
