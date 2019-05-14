const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    deviceToken: {
      type: String,
    },
    deviceType: {
      type: String,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    loginTimestamp: {
      type: Date,
    },
    logoutTimestamp: {
      type: Date,
    },
    status: {
      type: Number,
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true, // inserts createdAt and updatedAt
  },
);
module.exports = mongoose.model('session', schema);
