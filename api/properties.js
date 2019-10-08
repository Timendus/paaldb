const router          = require('express').Router();
const Logger          = require('../util/logger');
const propertyService = require('../services/property');

// GET /api/properties => List of all properties
router.get('/', async (req, res) => {
  try {
    res.json(await propertyService.findAll());
  } catch(err) {
    Logger.error(err);
    res.status(500).end();
  }
});

// GET /api/properties/:id => Get this property including mentions and locations
router.get('/:id', getProperty, async (req, res) => {
  res.json(req.property);
});

// Helper middleware
async function getProperty(req, res, next) {
  try {
    req.property = await propertyService.findOne(req.params.id);
    if ( !req.property ) {
      return res.status(404).end();
    }
  } catch(err) {
    Logger.error(err);
    return res.status(500).end();
  }

  next();
}

module.exports = router;
