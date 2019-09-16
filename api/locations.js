const router          = require('express').Router();
const Logger          = require('../util/logger');
const locationService = require('../services/location');

// GET /api/locations => List of all locations

router.get('/', async (req, res) => {
  try {
    const locations = await locationService.findAll();
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
    req.location = await locationService.findOne(req.params.id);
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
