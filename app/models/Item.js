const mongoose = require("mongoose");

let itemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  listId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  itemCreatorId: {
    type: String,
    required: true
  },
  itemCreatorName: {
    type: String,
    required: true
  },
  itemModifierId: {
    type: String,
    required: true
  },
  itemModifierName: {
    type: String,
    required: true
  },
  itemCreatedOn: {
    type: Date,
    default: Date.now()
  },
  itemModifiedOn: {
    type: Date,
    default: Date.now()
  },
  itemDone: {
    type: String,
    default: "no"
  },
  subItems: {
    type: [
      {
        subItemId: {
          type: String,
          default: ""
        },
        subItemName: {
          type: String,
          default: ""
        },
        subItemCreatorId: {
          type: String,
          default: ""
        },
        subItemCreatorName: {
          type: String,
          default: ""
        },
        subItemModifierId: {
          type: String,
          default: ""
        },
        subItemModifierName: {
          type: String,
          default: ""
        },
        subItemCreatedOn: {
          type: Date,
          default: Date.now()
        },
        subItemModifiedOn: {
          type: Date,
          default: Date.now()
        },
        subItemDone: {
          type: String,
          default: "no"
        }
      }
    ]
  }
});

module.exports = mongoose.model("Item", itemSchema);
