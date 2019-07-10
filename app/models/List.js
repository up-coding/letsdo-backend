const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  listId: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  listName: {
    type: String,
    require: true
  },
  creatorId: {
    type: String,
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  modifierId: {
    type: String,
    required: true
  },
  modifierName: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    default: "private"
  },
  createdOn: {
    type: Date,
    default: Date.now()
  },
  modifiedOn: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("List", listSchema);
