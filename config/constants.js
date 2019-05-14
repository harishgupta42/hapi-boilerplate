const Joi = require('joi');

module.exports = {
  swaggerDefaultResponseMessages() {
    // Default Messages for Swagger
    let successResponse;

    successResponse = Joi.object({
      key: 'value',
    });
    return {
      200: {
        description: 'Success',
        schema: Joi.object({
          statusCode: Joi.number().default('20X'),
          message: Joi.string(),
          data: successResponse,
        }).label('Result'),
      },
      400: {
        description: 'Bad Request',
        schema: Joi.object({
          statusCode: Joi.number().default('401'),
          error: Joi.string(),
          message: Joi.string().default('Bad Request'),
          data: Joi.object(),
        }).label('Result'),
      },
      401: {
        description: 'Unauthorized',
        schema: Joi.object({
          statusCode: Joi.number().default('401'),
          error: Joi.string(),
          message: Joi.string(),
          attributes: Joi.object(),
        }).label('Result'),
      },
      403: {
        description: 'Forbidden',
        schema: Joi.object({
          statusCode: Joi.number().default('403'),
          error: Joi.string().default('Forbidden'),
          message: Joi.string().default('Insufficient scope'),
        }).label('Result'),
      },
      500: {
        description: 'Server Errors',
        schema: Joi.object({
          statusCode: Joi.number().default('50X'),
          error: Joi.string(),
          message: Joi.string(),
          data: Joi.object(),
        }).label('Result'),
      },
    };
  },
  saltRounds: 10, // salt rounds for Bcrypt
  deviceType: ['IOS', 'ANDROID', 'WEB'],
  scopes: {
    USER: 'USER',
  },
  sessionStatus: {
    LOGGED_IN: 1,
    LOGGED_OUT: 2,
  },
};
