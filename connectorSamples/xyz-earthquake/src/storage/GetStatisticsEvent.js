const Event = require("./Event")

class GetStatisticsEvent extends Event {

  constructor(streamId, space) {
    super({type: "GetStatisticsEvent", streamId});
    this.space = space;
  }
}

module.exports = GetStatisticsEvent;
