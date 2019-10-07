const Logger     = require('../../util/logger');
const requireDir = require('../../util/require-dir');
module.exports   = requireDir(__filename, __dirname);

module.exports.run = () => {
  // Run all importers
  return Promise.all(
    Object.values(requireDir(__filename, __dirname))
          .map(i => i.run())
  );
}
