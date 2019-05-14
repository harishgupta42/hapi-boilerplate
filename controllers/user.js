const bcrypt = require('bcrypt');

const utils = require('../utils');
const models = require('../models');
const { logger } = require('../lib/logger');
const constants = require('../config/constants');
const statusCodes = require('../config/statusCodes');

/**
 * Register user
 * @param  {object} request
 * @param  {object} h
 */
async function registerUser(request, h) {
  try {
    const userInfo = request.payload;
    const checkEmail = await models.userModel.find({ email: userInfo.email });
    if (checkEmail.length > 0) {
      const response = {
        flag: statusCodes.NOT_ACCEPTABLE,
        message: statusCodes.getStatusText(statusCodes.NOT_ACCEPTABLE),
        description: 'Email already exists',
      };
      return response;
    }
    if (userInfo.password) {
      userInfo.password = bcrypt.hashSync(userInfo.password, constants.saltRounds); // encrypt password
    }

    let user = await models.userModel(userInfo).save({ lean: true });
    user = user.toObject();
    const tokenData = {
      id: user._id,
      scope: constants.scopes.USER,
      date: new Date().toISOString(),
      deviceType: userInfo.deviceType || null,
      deviceToken: userInfo.deviceToken || null,
    };

    const token = await utils.generateToken(tokenData);
    user.accessToken = token;
    const session = {
      userId: user._id,
      deviceToken: userInfo.deviceToken || null,
      deviceType: userInfo.deviceType || null,
      isBlocked: false,
      loginTimestamp: tokenData.date,
      status: constants.sessionStatus.LOGGED_IN,
      ipAddress: request.info.remoteAddress,
    };
    const response = {
      flag: statusCodes.OK,
      message: statusCodes.getStatusText(statusCodes.OK),
      data: user,
    };
    return response;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
/**
 * Get user details using Access Token also works as access token login
 * @param  {object} request
 * @param  {object} h
 */
async function getUser(request, h) {
  try {
    const filters = {
      _id: request.auth.credentials._id,
    };
    const user = await models.userModel.findOne(filters, {
      password: 0,
      emailVerificationToken: 0,
      phoneOtp: 0,
      resetToken: 0,
    });

    if (!user) {
      const response = {
        flag: statusCodes.UNAUTHORIZED,
        message: statusCodes.getStatusText(statusCodes.UNAUTHORIZED),
      };
      return response;
    }
    const response = {
      flag: statusCodes.OK,
      message: statusCodes.getStatusText(statusCodes.OK),
      data: user,
    };
    return response;
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
}
/**
 * Update user details using Access Token
 * @param  {object} request
 * @param  {object} h
 */
async function updateUser(request, h) {
  try {
    const filters = {
      _id: request.auth.credentials._id,
    };
    let user = await models.userModel.findOne(filters);
    const updateInfo = request.payload;

    user = await models.userModel.findOneAndUpdate(filters, updateInfo, {
      projection: {
        password: 0,
      },
      new: true,
    });
    const response = {
      flag: statusCodes.OK,
      message: statusCodes.getStatusText(statusCodes.OK),
      data: user,
    };
    return response;
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
}
/**
 * Login user using email and pasword
 * @param  {object} request
 * @param  {object} h
 */
async function loginUser(request, h) {
  try {
    const { payload } = request;
    const filters = {
      email: payload.email,
    };
    let user = await models.userModel.findOne(filters);
    if (!user) {
      const response = {
        flag: statusCodes.NOT_FOUND,
        message: statusCodes.getStatusText(statusCodes.NOT_FOUND),
        description: 'Email not found',
      };
      return response;
    }
    const checkPassword = bcrypt.compareSync(payload.password, user.password); // compare password string to encrypted string
    if (!checkPassword) {
      const response = {
        flag: statusCodes.NOT_ACCEPTABLE,
        message: statusCodes.getStatusText(statusCodes.NOT_ACCEPTABLE),
        description: 'Wrong password',
      };
      return response;
    }

    const tokenData = {
      id: user._id,
      scope: constants.scopes.USER,
      date: new Date().toISOString(),
      deviceType: payload.deviceType || null,
      deviceToken: payload.deviceToken || null,
    };
    const token = await utils.generateToken(tokenData); // generate JWT
    user = user.toObject();
    user.accessToken = token;
    const session = {
      userId: user._id,
      deviceToken: payload.deviceToken || null,
      deviceType: payload.deviceType || null,
      isBlocked: false,
      loginTimestamp: tokenData.date,
      status: constants.sessionStatus.LOGGED_IN,
      ipAddress: request.info.remoteAddress,
    };
    await models.sessionModel(session).save();

    const response = {
      flag: statusCodes.OK,
      message: statusCodes.getStatusText(statusCodes.OK),
      data: user,
    };
    return response;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
/**
 * Change Password
 * @param  {object} request
 * @param  {object} h
 */
async function changePassword(request, h) {
  try {
    const filters = {
      _id: request.auth.credentials._id,
    };
    const passwords = {
      oldPassword: request.payload.oldPassword,
      newPassword: request.payload.newPassword,
    };

    const user = await models.userModel.findOne(filters);
    if (!user) {
      const response = {
        flag: statusCodes.NOT_FOUND,
        message: statusCodes.getStatusText(statusCodes.NOT_FOUND),
      };
      return response;
    }
    const isValidPassword = bcrypt.compareSync(passwords.oldPassword, user.password);
    if (!isValidPassword) {
      const response = {
        flag: statusCodes.FORBIDDEN,
        message: statusCodes.getStatusText(statusCodes.FORBIDDEN),
        description: 'Old password did not match',
      };
      return response;
    }
    const isOldPassword = bcrypt.compareSync(passwords.newPassword, user.password);
    if (isOldPassword) {
      const response = {
        flag: statusCodes.FORBIDDEN,
        message: statusCodes.getStatusText(statusCodes.FORBIDDEN),
        description: 'New password same as old password',
      };
      return response;
    }
    passwords.newPassword = bcrypt.hashSync(passwords.newPassword, constants.saltRounds);
    const updateInfo = {
      password: passwords.newPassword,
    };
    await models.userModel.findOneAndUpdate(filters, updateInfo);
    const response = {
      flag: statusCodes.OK,
      message: statusCodes.getStatusText(statusCodes.OK),
      description: 'Password changed successfully',
    };
    return response;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
/**
 * Logout User
 * @param  {object} request
 * @param  {object} h
 */
async function logoutUser(request, h) {
  try {
    const filters = {
      _id: request.auth.credentials._id,
    };

    const user = await models.userModel.findOne(filters);
    if (!user) {
      const response = {
        flag: statusCodes.NOT_FOUND,
        message: statusCodes.getStatusText(statusCodes.NOT_FOUND),
        description: 'Incorrect token',
      };
      return response;
    }

    const updateInfo = {
      logoutTimestamp: new Date().toISOString(),
      status: constants.sessionStatus.LOGGED_OUT,
    };
    await models.sessionModel.findOneAndUpdate(
      {
        userId: user._id,
        $or: [
          {
            deviceToken: request.auth.credentials.deviceToken,
            deviceType: request.auth.credentials.deviceType,
          },
          {
            loginTimestamp: {
              $eq: request.auth.credentials.date,
            },
          },
        ],
      },
      updateInfo,
    );
    const response = {
      flag: statusCodes.OK,
      message: statusCodes.getStatusText(statusCodes.OK),
      description: 'Logged out successfully',
    };
    return response;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
module.exports = {
  registerUser,
  getUser,
  updateUser,
  loginUser,
  changePassword,
  logoutUser,
};
