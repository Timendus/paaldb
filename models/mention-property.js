const { sequelize, Sequelize } = require('../util/database');
const uuid = require('uuid');

const Mention  = require('./mention');
const Property = require('./property');

class MentionProperty extends Sequelize.Model {}

MentionProperty.init({}, {
  sequelize,
  modelName: 'MentionProperty',
  charset: 'utf8mb4'
});

Mention.belongsToMany(Property, { through: MentionProperty });
Property.belongsToMany(Mention, { through: MentionProperty });

module.exports = MentionProperty;
