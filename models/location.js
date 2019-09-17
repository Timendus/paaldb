const { sequelize, Sequelize } = require('../util/database');
const uuid = require('uuid');

class Location extends Sequelize.Model {}

Location.init({
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  latitude: Sequelize.FLOAT(11,8),
  longitude: Sequelize.FLOAT(11,8),
  fireHazard: Sequelize.STRING
}, {
  sequelize,
  modelName: 'Location',
  charset: 'utf8mb4'
});

Location.beforeCreate((location, _) => {
  return location.id = uuid();
});

Location.fireHazard = {
  NORMAL:  'Normaal',
  HIGH:    'Verhoogd'
};

module.exports = Location;
