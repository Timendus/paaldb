'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex(
      'Mentions',
      ['sourceId', 'externalId'],
      {
        fields: ['sourceId', 'externalId'],
        unique: true
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('Mentions', ['sourceId', 'externalId']);
  }
};
