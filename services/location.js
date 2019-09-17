const {Location, Mention} = require('../models');
const {Sequelize}          = require('../util/database');

module.exports = {

  findAll: () => {
    return Location.findAll({
      attributes: {
        include: [
          [ Sequelize.fn('COUNT', Sequelize.col('Mentions.id')), 'numberOfMentions' ]
        ]
      },
      include: [
        {
          model: Mention,
          attributes: []
        }
      ],
      group: [ 'Location.id' ]
    });
  },

  findOne: (id) => {
    return Location.findOne({
      where: { id },
      include: [
        {
          all: true,
          nested: true
        }
      ]
    });
  },

  // Note: Returns a Location object
  findNearestInMemory: ({locations, latitude, longitude}) => {
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
  },

  // Note: Returns a Promise
  findNearestInDatabase: ({latitude, longitude}) => {
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

};
