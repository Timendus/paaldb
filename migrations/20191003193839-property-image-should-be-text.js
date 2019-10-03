'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Properties', 'image', Sequelize.TEXT);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Properties', 'image', Sequelize.STRING);
  }
};
