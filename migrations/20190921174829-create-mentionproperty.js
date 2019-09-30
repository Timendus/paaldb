'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('MentionProperties', {
      mentionId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "Mentions",
          key: "id"
        }
      },
      propertyId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "Properties",
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
    }, {
      charset: 'utf8mb4'
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('MentionProperties');
  }
};
