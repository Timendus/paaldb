const {Source} = require('../models');

module.exports = {

  findAll: () => {
    return Source.findAll();
  },

  findOne: (id) => {
    return Source.findOne({
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
