const Event = require("./Event")

class ModifySpaceEvent extends Event {

  constructor(event) {
    super(event);
    this.operation = event.operation;
    this.spaceDefinition = event.spaceDefinition;
  }

  _findConnectors(field, id) {
    let connectors = this.spaceDefinition[field];
    if (!connectors || !connectors.length) return [];
    return connectors.filter(c => c.id == id);
  }

  findListeners(id) {
    return this._findConnectors("listeners", id);
  }

  findProcessors(id) {
    return this._findConnectors("processors", id);
  }

}

module.exports = ModifySpaceEvent;
