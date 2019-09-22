const { sequelize, Sequelize } = require('../util/database');
const uuid = require('uuid');

class Source extends Sequelize.Model {}

Source.init({
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  contact: Sequelize.STRING
}, {
  sequelize,
  modelName: 'Source',
  charset: 'utf8mb4'
});

Source.beforeCreate((source, _) => {
  return source.id = uuid();
});

module.exports = Source;
