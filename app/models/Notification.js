const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const time = require("../libs/timeLib");

const notificationSchema = new Schema({
  notificationId: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  type: {
    type: String,
    default: ""
  },
  userId: {
    type: String,
    default: ""
  },
  userName: {
    type: String,
    default: ""
  },
  creatorId: {
    type: String,
    default: ""
  },
  creatorName: {
    type: String,
    default: ""
  },
  createdOn: {
    type: Date,
    default: Date.now()
  },
  data: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
