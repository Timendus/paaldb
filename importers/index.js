// Load all files in this directory

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const importers = {};

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index == 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const importer = require(path.join(__dirname, file));
    importers[camelize(importer.name)] = importer;
  });

module.exports = importers;
