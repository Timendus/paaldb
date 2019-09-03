const { sequelize, Sequelize } = require('../util/database');
const uuid = require('uuid');

class Location extends Sequelize.Model {}

// Returns a Location object
Location.findNearestInMemory = ({locations, latitude, longitude}) => {
  return locations
  .map(l => {
    l.distance = Math.sqrt(
      Math.pow(l.latitude - latitude, 2) +
      Math.pow(l.longitude - longitude, 2)
    );
    return l;
  })
  .sort((l1, l2) => l1.distance - l2.distance)
  .shift();
}

// Returns a Promise
Location.findNearestInDatabase = ({latitude, longitude}) => {
  return Location.findAll({
    attributes: {
      include: [
        [
          sequelize.fn(
            'sqrt',
            sequelize.literal(`POW(latitude - ${latitude}, 2) + POW(longitude - ${longitude}, 2)`)
          ),
          'distance'
        ]
      ]
    },
    order: [
      [sequelize.col('distance'), 'ASC']
    ],
    limit: 1
  });
}

Location.init({
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  latitude: Sequelize.FLOAT(11,8),
  longitude: Sequelize.FLOAT(11,8)
}, {
  sequelize,
  modelName: 'Location'
});

Location.beforeCreate((location, _) => {
  return location.id = uuid();
});

module.exports = Location;
