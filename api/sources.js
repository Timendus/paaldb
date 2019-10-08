const router        = require('express').Router();
const Logger        = require('../util/logger');
const sourceService = require('../services/source');

// GET /api/sources => List of all sources
router.get('/', async (req, res) => {
  try {
    res.json(await sourceService.findAll());
  } catch(err) {
    Logger.error(err);
    res.status(500).end();
  }
});

// GET /api/sources/:id => Get this source including mentions and locations
router.get('/:id', getSource, async (req, res) => {
  res.json(req.source);
});

// Helper middleware
async function getSource(req, res, next) {
  try {
    req.source = await sourceService.findOne(req.params.id);
    if ( !req.source ) {
      return res.status(404).end();
    }
  } catch(err) {
    Logger.error(err);
    return res.status(500).end();
  }

  next();
}

module.exports = router;
