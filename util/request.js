const Logger = require('./logger');

class Request {

  constructor(urlString) {
    return new Promise((resolve, reject) => {
      const url = require('url');
      const urlObj = url.parse(urlString);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.path,
        method: 'GET'
      }

      let http = require('http');
      if ( urlObj.protocol == "https:" ) {
        http = require('https');
      }

      const req = http.request(options, (res) => {
        Logger.log(`Request to '${urlString}' status code: ${res.statusCode}`);

        if ( res.statusCode != 200 )
          return reject('Request: Page not found');

        let result = '';

        res.on('data', (d) => {
          result += d;
        })
        res.on('end', () => {
          resolve(result);
        })
      });

      req.on('error', (error) => {
        return reject(`Request to '${urlString}' failed with error: ${error}`);
      });

      req.end()
    });
  }

}

module.exports = Request;
