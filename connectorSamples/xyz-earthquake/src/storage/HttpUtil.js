const http = require("http"),
  https = require("https"),
  {URL} = require("url"),
  zlib = require("zlib");

/**
 * Makes an HTTP(S) query to the specified URL using the specified HTTP method.
 *
 * @param url
 * @param method
 * @param headers
 * @param data
 * @param callback
 * @private
 */
function _doReq(url, method, headers, data, callback) {
  console.debug("Sending %s request to %s\nRequest body size: %d\nHeaders:\n%o", method, url, data ? data.length : 0, headers);
  let urlObj = url instanceof URL ? url : new URL(url);
  try {
    let body = "";
    let req = (urlObj.protocol == "https:" ? https : http).request(_createReqOptions(method, headers, urlObj), response => {
      let stream = response,
        withGzip = false;
      if (response.headers["content-encoding"] == "gzip") {
        stream = zlib.createGunzip();
        stream.on("error", callback);
        withGzip = true;
      }
      stream.on("data", d => body += d);
      stream.on("end", () => {
        if (response.statusCode < 200 || response.statusCode > 299)
          callback(new HttpError("Received un-successful HTTP response.\n" +
              "Status code: " + response.statusCode + "\n" +
              "Response:\n" + body, response.statusCode, body, response.headers));
        else
          callback(null, body);
      });
      if (withGzip) response.pipe(stream);
    });
    req.on("error", callback);
    data && req.write(data);
    req.end();
  }
  catch(e) {
    callback(e);
  }
}

function _createReqOptions(method, headers, urlObj) {
  let options = {
    method: method,
    protocol: urlObj.protocol,
    host: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname + urlObj.search,
    headers: headers
  };
  return options;
}

async function get(url, headers = {}) {
  return await doReq(url, "GET", null, headers);
}

async function post(url, data = null, headers = {}) {
  return await doReq(url, "POST", data, headers);
}

async function del(url, headers = {}) {
   return await doReq(url, "DELETE", null, headers);
}

function doReq(url, method, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    _doReq(url, method, headers, data, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

class HttpError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} body
   * @param {object} responseHeaders
   */
   constructor(message, statusCode, body, responseHeaders) {
     super(message);
     this.statusCode = statusCode;
     this.body = body;
     this.responseHeaders = responseHeaders;
   }
}

module.exports = {
  get: get,
  post: post,
  del: del,
  doReq: doReq,
  HttpError
};
