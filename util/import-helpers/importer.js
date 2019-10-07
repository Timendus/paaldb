const save         = require('./save').save;
const Logger       = require('../logger');
const Request      = require('../request');

module.exports = ({task, url, source, mentions, parser}) => ({
  run: async () => {
    let result;
    try {
      result = await new Request(url);
    } catch(error) {
      return Logger.error(`Error in request: ${error}`);
    }

    if (!result)
      return Logger.error(`Received no content from ${url}`);

    try {
      result = parser(result);
    } catch(error) {
      return Logger.error(`Error in parsing data: ${error}`);
    }

    try {
      source = source(result);
    } catch(error) {
      return Logger.error(`Error in source function: ${error}`);
    }

    try {
      mentions = mentions(result, source);
    } catch(error) {
      return Logger.error(`Error in mentions function: ${error}`);
    }

    try {
      await save({task, source, mentions});
    } catch(error) {
      return Logger.error(`Error in saving source and mentions: ${error}`);
    }
  }
});
