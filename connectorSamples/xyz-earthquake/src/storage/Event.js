class Event {

  constructor(event) {
    if (!event)
      this.type = this.constructor.name;
    else
      this.type = event.type;
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = Event;
