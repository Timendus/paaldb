const importer = require('./importer');

module.exports = (options = {}) => {
  options.parser = json => {
    return JSON.parse(json);
  };

  return importer(options);
};
