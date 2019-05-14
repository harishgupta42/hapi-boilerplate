const log4js = require('log4js');
const config = require('config');

log4js.configure({
  appenders: { out: { type: 'stdout', layout: { type: 'coloured' } } },
  categories: { default: { appenders: ['out'], level: 'ALL' } },
});

exports.logger = log4js.getLogger(`[${config.get('appName')}]`);
