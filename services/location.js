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
  }

};
