const Request        = require('../util/request');
const Logger         = require('../util/logger');
const pointInPolygon = require('robust-point-in-polygon');
const {Location}     = require('../models');

module.exports.run = async () => {
  let result = await new Request(`https://www.natuurbrandrisico.nl/maps/script_all_regios.js?ts=${Date.now().valueOf()}`);
  const locations = await Location.findAll();

  // Cut off the parts that aren't JSON
  result = result.substring("NBR.RegionsDefinition = ".length);
  result = result.substring(0, result.length - 1);

  // Parse the rest
  result = JSON.parse(result);

  // Bookkeeping
  let numChanged = 0;
  let matches    = 0;

  // Find the right region for each location
  for ( const l of locations ) {
    for ( const r of result ) {

      // Is our location in this region?
      if ( pointInPolygon(r.coords[0], [l.longitude, l.latitude]) < 1 ) {
        // Store fire hazard status
        switch(r.fase) {
          case 'FASE_1':
            l.fireHazard = Location.fireHazard.NORMAL;
            break;
          case 'FASE_2':
            l.fireHazard = Location.fireHazard.HIGH;
            break;
          default:
            l.fireHazard = null;
            break;
        }

        matches++;
        if ( l.changed() ) numChanged++;
        await l.save();
      }

    }
  }

  Logger.log(`Natuurbrandrisico.nl: Changed fire hazard status on ${numChanged}/${matches} location(s)`);
}
