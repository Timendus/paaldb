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
  }

}
