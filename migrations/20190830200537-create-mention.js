'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Mentions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      latitude: {
        type: Sequelize.DECIMAL(11,8)
      },
      longitude: {
        type: Sequelize.DECIMAL(11,8)
      },
      height: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      sourceId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "Sources",
          key: "id"
        }
      },
      locationId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: "Locations",
          key: "id"
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Mentions');
  }
};
