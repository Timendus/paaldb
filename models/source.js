const { sequelize, Sequelize } = require('../util/database');
const uuid = require('uuid');

class Source extends Sequelize.Model {}

Source.init({
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  contact: Sequelize.STRING
}, {
  sequelize,
  modelName: 'Source'
});

Source.beforeCreate((location, _) => {
  return location.id = uuid();
});

module.exports = Source;
