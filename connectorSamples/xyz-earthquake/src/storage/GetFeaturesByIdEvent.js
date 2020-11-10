const Event = require("./Event")

class GetFeaturesByIdEvent extends Event {

  constructor(streamId, ids, selection) {
    super({type: "GetFeaturesByIdEvent", streamId});
    this.ids = ids;
    this.selection = selection;
  }
}

module.exports = GetFeaturesByIdEvent;
