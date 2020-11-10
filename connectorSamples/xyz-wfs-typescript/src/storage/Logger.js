const util = require("util");

class Logger {

    constructor() {
        if (Logger._instance) throw new Error("Logger was already instantiated!");
        Logger._instance = this;
        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        if (process.env.DEBUG == "true")
            this.debug = this.debug.bind(this);
        else
            this.debug = () => {};
    }

    /**
     * The stream identifier for logging purpose.
     */
    get streamId() {
        return this._streamId;
    }

    set streamId(streamId) {
        this._streamId = streamId;
    }

    //Formatting, see: https://nodejs.org/api/util.html#util_util_format_format_args
    log(...args) {
        console.log(this._format.apply(this, args));
    }

    error(...args) {
        console.error(this._format.apply(this, args));
    }

    debug(...args) {
        console.debug(this._format.apply(this, args));
    }

    _format(...args) {
        if (args[0] instanceof Error) {
            args.unshift("%O");
        }
        if (this._streamId) {
            args[0] = "%s - " + args[0];
            args.splice(1, 0, this._streamId);
        }
        let text = args[0];
        if (args.length > 1) {
            text = util.format.apply(null, args);
        }
        return text;
    }

    static get instance() {
        return Logger._instance || new Logger();
    }
}

module.exports = Logger;