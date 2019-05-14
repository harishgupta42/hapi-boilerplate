const config = require('config');
const JWT = require('jsonwebtoken');

const { logger } = require('./lib/logger');
const statusCodes = require('./config/statusCodes');

/*
 * Compresses a given response object and sends it.
 * @param  {object} response    Contains the final result of any API
 * @param  {stream} h           hapi response tookit stream
 */
function sendSuccessResponse(data, h) {
  const dataToSend = data;
  if (!dataToSend.flag) {
    dataToSend.flag = statusCodes.OK;
  }
  if (!dataToSend.message) {
    dataToSend.message = statusCodes.getStatusText(statusCodes.OK);
  }
  const response = {
    statusCode: dataToSend.flag,
    message: dataToSend.description || dataToSend.message,
    data: dataToSend.data || null,
  };
  // if (data.data) {
  //   response.data = data.data;
  // }
  return h.response(response);
}

/**
 * Sends a response in case of an error
 * @param  {object} error       {responseFlag, responseMessage}
 * @param  {stream} h           h stream
 */
function sendErrorResponse(error, h) {
  const errorToSend = error;
  if (!errorToSend.flag) {
    errorToSend.flag = statusCodes.METHOD_FAILURE;
  }
  if (!errorToSend.responseMessage) {
    errorToSend.responseMessage = errorToSend.message || statusCodes.getStatusText(statusCodes.METHOD_FAILURE);
  }

  // if (errorToSend.addnInfo) {
  //   for (const key in errorToSend.addnInfo) {
  //     errorToSend[key] = errorToSend.addnInfo[key];
  //   }
  // }
  return h.response({
    statusCode: errorToSend.flag,
    message: errorToSend.description || error.message || 'OK',
    error: errorToSend.error || {},
  });
}
function failActionFunction(request, h, error) {
  const customError = error;
  logger.info('error', error.output.payload);
  let customErrorMessage = '';
  if (customError.output.payload.message.indexOf('[') > -1) {
    customErrorMessage = customError.output.payload.message.substr(
      customError.output.payload.message.indexOf('['),
    );
  } else {
    customErrorMessage = customError.output.payload.message;
  }
  customErrorMessage = customErrorMessage.replace(/"/g, '');
  customErrorMessage = customErrorMessage.replace('[', '');
  customErrorMessage = customErrorMessage.replace(']', '');
  customErrorMessage = customErrorMessage[0].toUpperCase() + customErrorMessage.slice(1);
  customError.output.payload.message = customErrorMessage;
  delete customError.output.payload.validation;
  return customError;
}
async function generateToken(tokenData) {
  const secret = config.get('secretKey');
  try {
    const token = JWT.sign(tokenData, secret);
    return token;
  } catch (err) {
    return err;
  }
}
module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  failActionFunction,
  generateToken,
};
