const {Property} = require('../models');

module.exports = {

  findAll: () => {
    return Property.findAll();
  },

  findOne: (id) => {
    return Property.findOne({
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
