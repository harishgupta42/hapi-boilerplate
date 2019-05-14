const Joi = require('joi');

const constants = require('../config/constants');
const controller = require('../controllers');
const utils = require('../utils');

module.exports = [
  {
    /** ********** Create user ************ */
    method: 'POST',
    path: '/user',
    handler: (request, h) => controller.user
      .registerUser(request, h)
      .then(response => utils.sendSuccessResponse(response, h))
      .catch(error => utils.sendErrorResponse(error, h)),
    options: {
      auth: false,
      description: 'Register User',
      tags: ['api', 'user'],
      validate: {
        payload: Joi.object({
          firstName: Joi.string()
            .regex(/^[a-zA-Z\s]+$/)
            .min(3)
            .trim()
            .required()
            .description('Enter first name'),
          lastName: Joi.string()
            .regex(/^[a-zA-Z\s]+$/)
            .min(3)
            .trim()
            .required()
            .description('Enter last name'),
          email: Joi.string()
            .email()
            .trim()
            .lowercase()
            .required()
            .description('Enter email'),
          password: Joi.string()
            .trim()
            .required()
            .description('Enter password'),
          deviceToken: Joi.string(),
          deviceType: Joi.string().valid(constants.deviceType),
        }),
        failAction: utils.failActionFunction,
      },
      plugins: {
        'hapi-swagger': {
          response: constants.swaggerDefaultResponseMessages(),
        },
      },
    },
  },
  {
    /** ********** Get user details using access token ************ */
    method: 'GET',
    path: '/user',
    handler: (request, h) => controller.user
      .getUser(request, h)
      .then(response => utils.sendSuccessResponse(response, h))
      .catch(error => utils.sendErrorResponse(error, h)),
    options: {
      auth: {
        scope: constants.scopes.USER,
      },
      description: 'Get User details',
      tags: ['api', 'user'],
      validate: {
        headers: Joi.object({
          authorization: Joi.string()
            .required()
            .description('Access Token'),
        }).unknown(),
        failAction: utils.failActionFunction,
      },
      plugins: {
        'hapi-swagger': {
          response: constants.swaggerDefaultResponseMessages(),
        },
      },
    },
  },
  {
    /** ********** Update user details ************ */
    method: 'PUT',
    path: '/user',
    handler: (request, h) => controller.user
      .updateUser(request, h)
      .then(response => utils.sendSuccessResponse(response, h))
      .catch(error => utils.sendErrorResponse(error, h)),
    options: {
      auth: {
        scope: constants.scopes.USER,
      },
      description: 'Update User details',
      tags: ['api', 'user'],
      validate: {
        payload: {
          firstName: Joi.string()
            .regex(/^[a-zA-Z\s]+$/)
            .min(3)
            .trim()
            .description('Enter first name'),
          lastName: Joi.string()
            .regex(/^[a-zA-Z\s]+$/)
            .min(3)
            .trim()
            .description('Enter last name'),
          countryCode: Joi.string().description('Enter phone country code'),
          phoneNumber: Joi.string()
            .trim()
            .description('Enter you mobile number'),
          country: Joi.string().description('Enter your country'),
        },
        headers: Joi.object({
          authorization: Joi.string()
            .required()
            .description('Access Token'),
        }).unknown(),
        failAction: utils.failActionFunction,
      },
      plugins: {
        'hapi-swagger': {
          response: constants.swaggerDefaultResponseMessages(),
        },
      },
    },
  },
  {
    /** ********** User login ************ */
    method: 'POST',
    path: '/user/login',
    handler: (request, h) => controller.user
      .loginUser(request, h)
      .then(response => utils.sendSuccessResponse(response, h))
      .catch(error => utils.sendErrorResponse(error, h)),
    options: {
      auth: false,
      description: 'Login User',
      tags: ['api', 'user'],
      validate: {
        payload: Joi.object({
          email: Joi.string()
            .email()
            .trim()
            .lowercase()
            .required()
            .description('Enter email'),
          password: Joi.string()
            .trim()
            .required()
            .description('Enter password'),
          deviceToken: Joi.string(),
          deviceType: Joi.string().valid(constants.deviceType),
        }),
        failAction: utils.failActionFunction,
      },
      plugins: {
        'hapi-swagger': {
          response: constants.swaggerDefaultResponseMessages(),
        },
      },
    },
  },
  {
    /** ********** Changer user password ************ */
    method: 'POST',
    path: '/user/changePassword',
    handler: (request, h) => controller.user
      .changePassword(request, h)
      .then(response => utils.sendSuccessResponse(response, h))
      .catch(error => utils.sendErrorResponse(error, h)),
    options: {
      auth: {
        scope: constants.scopes.USER,
      },
      description: 'Change user password',
      tags: ['api', 'user'],
      validate: {
        payload: Joi.object({
          oldPassword: Joi.string()
            .required()
            .description('Enter old password'),
          newPassword: Joi.string()
            .required()
            .description('Enter new password'),
        }),
        headers: Joi.object({
          authorization: Joi.string()
            .required()
            .description('Access Token'),
        }).unknown(),
        failAction: utils.failActionFunction,
      },
      plugins: {
        'hapi-swagger': {
          response: constants.swaggerDefaultResponseMessages(),
        },
      },
    },
  },
  {
    /** ********** Logout User ************ */
    method: 'PUT',
    path: '/user/logout',
    handler: (request, h) => controller.user
      .logoutUser(request, h)
      .then(response => utils.sendSuccessResponse(response, h))
      .catch(error => utils.sendErrorResponse(error, h)),
    options: {
      description: 'Logout user',
      tags: ['api', 'user'],
      validate: {
        headers: Joi.object({
          authorization: Joi.string()
            .required()
            .description('Access Token'),
        }).unknown(),
        failAction: utils.failActionFunction,
      },
      plugins: {
        'hapi-swagger': {
          response: constants.swaggerDefaultResponseMessages(),
        },
      },
    },
  },
];
