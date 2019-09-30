const { sequelize, Sequelize } = require('../util/database');
const uuid = require('uuid');

const Location = require('./location');
const Source   = require('./source');

class Mention extends Sequelize.Model {}

Mention.init({
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  latitude: Sequelize.STRING,
  longitude: Sequelize.STRING,
  height: Sequelize.INTEGER,
  status: Sequelize.STRING,
  externalId: Sequelize.STRING,
  date: Sequelize.DATE,
  link: Sequelize.STRING
}, {
  sequelize,
  modelName: 'Mention',
  charset: 'utf8mb4'
});

Mention.beforeCreate((mention, _) => {
  return mention.id = uuid();
});

Mention.belongsTo(Source);
Mention.belongsTo(Location);
Source.hasMany(Mention);
Location.hasMany(Mention);

Mention.status = {
  ACTIVE: 'Actief',
  STALE:  'Verwijderd'
};

module.exports = Mention;
