const router                 = require('express').Router();
const Logger                 = require('../util/logger');
const mentionPropertyService = require('../services/mention-property');

// GET /api/mentionProperties => List of all mention-property mappings
router.get('/', async (req, res) => {
  try {
    res.json(await mentionPropertyService.findAll());
  } catch(err) {
    Logger.error(err);
    res.status(500).end();
  }
});

module.exports = router;
