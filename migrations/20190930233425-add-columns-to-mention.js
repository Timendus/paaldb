'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Mentions', 'externalId', Sequelize.STRING),
      queryInterface.addColumn('Mentions', 'date', Sequelize.DATE),
      queryInterface.addColumn('Mentions', 'link', Sequelize.STRING)
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Mentions', 'externalId'),
      queryInterface.removeColumn('Mentions', 'date'),
      queryInterface.removeColumn('Mentions', 'link')
    ]);
  }
};
