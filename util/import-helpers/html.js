const importer      = require('./importer');
const htmlConverter = require('node-html-parser');

module.exports = ({task, url, source, mentionUrls, mentions}) => {
  return importer({
    task, url, source, mentionUrls, mentions,

    parser: (html) => {
      return htmlConverter.parse(html);
    }
  });
}
