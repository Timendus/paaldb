const { sequelize, Sequelize } = require('../util/database');
const uuid = require('uuid');

class Property extends Sequelize.Model {}

Property.init({
  label: Sequelize.STRING,
  image: Sequelize.STRING,
  description: Sequelize.STRING,
  value: Sequelize.STRING
}, {
  sequelize,
  modelName: 'Property',
  charset: 'utf8mb4'
});

Property.beforeCreate((property, _) => {
  return property.id = uuid();
});

module.exports = Property;
