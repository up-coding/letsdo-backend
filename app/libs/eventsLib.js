const events = require("events");
const eventEmitter = new events.EventEmitter();

let emitEvent = (event, data) => {
  eventEmitter.emit(event, data);
};

let listen = (event, callback) => {
  eventEmitter.on(event, callback);
};

module.exports = {
  emit: emitEvent,
  on: listen
};
