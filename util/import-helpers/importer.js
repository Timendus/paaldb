// This file defines the DSL for the importers. It exports a function that
// returns an object with an asynchronous `run` method. When run, that method
// does what's been defined in the importer file.
//
// The DSL currently supports, as special features, paginated responses and
// mentions spread over several different URLs.

const save    = require('./save');
const Logger  = require('../logger');
const Request = require('../request');
const array   = require('../array');

module.exports = ({
  task,
  url,
  nextUrl = () => false,
  combineResponses = (a) => array.last(a),
  source,
  mentionUrls,
  mentions,
  parser,
  projection
}) => {

  async function run() {
    let result = [];
    try {
      let next = url;
      do {
        result.push(await fetchAndParse(next, parser));
        next = nextUrl(array.last(result));
      } while ( next );
    } catch(error) {
      return Logger.error(`Error fetching and parsing: ${error}`);
    }

    try {
      result = combineResponses(result);
    } catch(error) {
      return Logger.error(`Error combining responses: ${error}`);
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
      await save({task, source, mentions, projection});
    } catch(error) {
      return Logger.error(`Error in saving source and mentions: ${error}`);
    }
  }

  async function fetchAndParse(url, parser) {
    let result;
    try {
      result = await new Request(url);
    } catch(error) {
      throw(`Error in request: ${error}`);
    }

    if (!result)
      throw(`Received no content from ${url}`);

    try {
      result = parser(result);
    } catch(error) {
      throw(`Error in parsing data: ${error}`);
    }

    return result;
  }

  async function fetchMentions({mentionUrls, mentions, result, source, parser}) {
    const fetchedMentions = [];

    for ( const url of mentionUrls(result) ) {
      let result;
      try {
        result = await fetchAndParse(url, parser);
      } catch(error) {
        throw(`Error in mention request: ${error}`);
      }

      try {
        fetchedMentions.push(...mentions(result, {source, url}));
      } catch(error) {
        throw(`Error in mentions function: ${error}`);
      }
    }

    return fetchedMentions;
  }

  return {
    run,
    fetchAndParse: (url) => fetchAndParse(url, parser)
  };

};
