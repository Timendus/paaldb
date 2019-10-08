const {Mention}   = require('../models');
const {Sequelize} = require('../util/database');

module.exports = {

  findNewest: () => {
    return Mention.findAll({
      order: [
        [Sequelize.col('updatedAt'), 'DESC']
      ],
      limit: 1
    })
  },

  findAll: () => {
    return Mention.findAll();
  },

  findOne: (id) => {
    return Mention.findOne({
      where: { id },
      include: [
        {
          all: true,
          nested: true
        }
      ]
    });
  }

}
