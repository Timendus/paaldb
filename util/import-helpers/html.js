const importer      = require('./importer');
const htmlConverter = require('node-html-parser');

module.exports = ({task, url, source, mentions}) => {
  return importer({
    task, url, source, mentions,

    parser: (html) => {
      return htmlConverter.parse(html);
    }
  });
}
