// Load all files in this directory

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const tasks = {};
const camelcase = require('../util/camelcase');

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(file => {
    const task = require(path.join(__dirname, file));
    tasks[camelcase(task.name)] = task;
  });

module.exports = tasks;
