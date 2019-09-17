const router = require('express').Router();
const Logger = require('../util/logger');
const config = require('../util/config')['mapbox'];

// GET /mapbox/token => The Mapbox token from the config/config.json file
router.get('/token', async (req, res) => {
  res.send(config.token);
});

module.exports = router;
