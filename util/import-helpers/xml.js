const importer  = require('./importer');
const xmlParser = require('xml-js');

module.exports = (options) => {
  options.parser = xml => {
    return xmlParser.xml2js(xml, {
      compact:           true,
      ignoreDeclaration: true,
      ignoreAttributes:  true,
      trim:              true
    });
  };

  return importer(options);
};
