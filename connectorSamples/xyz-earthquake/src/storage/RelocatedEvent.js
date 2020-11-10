
class RelocatedEvent {

  constructor(streamId, uri) {
    this.type = "RelocatedEvent";
    this.streamId = streamId;
    this.URI = uri;
  }
}

module.exports = RelocatedEvent;