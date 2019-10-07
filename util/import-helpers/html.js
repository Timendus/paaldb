const importer   = require('./importer');
const htmlParser = require('node-html-parser');

module.exports = (options) => {
  options.parser = html => {
    return htmlParser.parse(html);
  };

  return importer(options);
};
