const mongoose = require("mongoose");

let historySchema = new mongoose.Schema({
  historyId: {
    type: String,
    index: true,
    unique: true,
    default: ""
  },
  listId: {
    type: String,
    default: ""
  },
  itemId: {
    type: String,
    default: ""
  },
  subItemId: {
    type: String,
    default: ""
  },
  key: {
    type: String,
    default: ""
  },
  itemValues: [],
  createdOn: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("History", historySchema);
