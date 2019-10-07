const save         = require('./save').save;
const Logger       = require('../logger');
const Request      = require('../request');

module.exports = ({task, url, source, mentionUrls, mentions, parser}) => ({
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
      if ( !mentionUrls ) {
        mentions = mentions(result, {source, url});
      } else {
        mentions = await fetchMentions({mentionUrls, mentions, result, source, parser});
      }
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

async function fetchMentions({mentionUrls, mentions, result, source, parser}) {
  const fetchedMentions = [];

  for ( const url of mentionUrls(result) ) {
    let result;
    try {
      result = await new Request(url);
    } catch(error) {
      throw(`Error in mention request: ${error}`);
    }

    if (!result)
      throw(`Received no mention content from ${url}`);

    try {
      result = parser(result);
    } catch(error) {
      throw(`Error in parsing mention data: ${error}`);
    }

    try {
      fetchedMentions.push(...mentions(result, {source, url}));
    } catch(error) {
      throw(`Error in mentions function: ${error}`);
    }
  }

  return fetchedMentions;
}
