const { sequelize, Sequelize } = require('../util/database');
const uuid = require('uuid');

class Location extends Sequelize.Model {}

Location.init({
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  latitude: Sequelize.STRING,
  longitude: Sequelize.STRING
}, {
  sequelize,
  modelName: 'Location'
});

Location.beforeCreate((location, _) => {
  return location.id = uuid();
});

module.exports = Location;
