const router               = require('express').Router();
const Logger               = require('../util/logger');
const {Location, Mention}  = require('../models');
const {Sequelize}          = require('../util/database');

// GET /api/locations => List of all locations

router.get('/', async (req, res) => {
  try {
    const locations = await Location.findAll({
      attributes: {
        include: [
          [ Sequelize.fn('COUNT', Sequelize.col('Mentions.id')), 'numberOfMentions' ]
        ]
      },
      include: [
        {
          model: Mention,
          attributes: []
        }
      ],
      group: [ 'Location.id' ]
    });
    res.json(locations);
  } catch(err) {
    Logger.error(err);
    res.status(500).end();
  }
});

// GET /api/locations/:id => Get this location including mentions and sources

router.get('/:id', getLocation, async (req, res) => {
  res.json(req.location);
});

// Helper middleware

async function getLocation(req, res, next) {
  try {
    req.location = await Location.findOne({
      where: {
        id: req.params.id
      },
      include: [
        {
          all: true,
          nested: true
        }
      ]
    });
    if ( !req.location ) {
      return res.status(404).end();
    }
  } catch(err) {
    Logger.error(err);
    return res.status(500).end();
  }

  next();
}

module.exports = router;
