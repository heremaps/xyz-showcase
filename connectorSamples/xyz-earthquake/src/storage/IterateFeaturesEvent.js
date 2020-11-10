const Event = require("./Event");

class IterateFeaturesEvent extends Event {

  constructor(tags = null, handle = null, limit = 30000) {
    super();
    this.tags = tags;
    this.handle = handle;
    this.limit = limit;
  }

}

module.exports = IterateFeaturesEvent;
