const importer     = require('./importer');
const xmlConverter = require('xml-js');

module.exports = ({task, url, source, mentionUrls, mentions}) => {
  return importer({
    task, url, source, mentionUrls, mentions,

    parser: xml => {
      return xmlConverter.xml2js(xml, {
        compact:           true,
        ignoreDeclaration: true,
        ignoreAttributes:  true,
        trim:              true
      });
    }
  });
}
