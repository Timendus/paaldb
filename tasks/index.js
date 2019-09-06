const requireDir = require('../util/require-dir');

// Load all files in this directory
module.exports = requireDir(__filename, __dirname);
