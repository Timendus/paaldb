const router         = require('express').Router();
const Logger         = require('../util/logger');
const mentionService = require('../services/mention');

// GET /api/mentions => List of all mentions
router.get('/', async (req, res) => {
  try {
    res.json(await mentionService.findAll());
  } catch(err) {
    Logger.error(err);
    res.status(500).end();
  }
});

// GET /api/mentions/:id => Get this mention including sources, locations and properties
router.get('/:id', getMention, async (req, res) => {
  res.json(req.mention);
});

// Helper middleware
async function getMention(req, res, next) {
  try {
    req.mention = await mentionService.findOne(req.params.id);
    if ( !req.mention ) {
      return res.status(404).end();
    }
  } catch(err) {
    Logger.error(err);
    return res.status(500).end();
  }

  next();
}

module.exports = router;
