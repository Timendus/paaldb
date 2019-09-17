const taskRunner          = require('../util/task-runner');
const Logger              = require('../util/logger');
const {Location, Mention} = require('../models');
const locationService     = require('../services/location');

// Function to create and link locations
module.exports.run = async () => {
  const mentions = await Mention.findAll({
    include: [{
      model: Location
    }]
  });

  const locations = await Location.findAll({
    include: [{
      model: Mention
    }]
  });

  const {locationsToCreate, locationsToLink} = findLocations(locations, mentions);

  await createLocations(locationsToCreate);
  await linkLocations(locationsToLink);

  Logger.log(`Created ${locationsToCreate.length} new location(s) and linked ${locationsToLink.length} location(s) to new mentions`);
};

function findLocations(locations, mentions) {

  // Create somewhere to store the reverse links
  locations.forEach(l => l.mentions = []);

  // Bookkeeping
  const locationsToCreate = [];
  const locationsToLink   = [];

  mentions.forEach(mention => {

    // Mention already linked?
    if ( mention.Location ) return;

    // Otherwise, find the closest location to this mention
    const location = locationService.findNearestInMemory({
      locations: locations.concat(locationsToCreate),
      latitude:  mention.latitude,
      longitude: mention.longitude
    });

    // Is the location close enough? Then link it
    if ( location && location.distance < 0.001 ) {
      location.mentions.push(mention);

      if ( location.id )
        locationsToLink.push(location);
    }

    // Otherwise, create a new location
    else {
      locationsToCreate.push({
        name: mention.name,
        latitude: mention.latitude,
        longitude: mention.longitude,
        mentions: [mention]
      });
    }

  });

  return {
    locationsToCreate: locationsToCreate,
    locationsToLink:   [...new Set(locationsToLink)] // "unique"
  };
}

async function createLocations(locations) {
  for ( const location of locations ) {
    const record = await Location.create(location);
    await record.setMentions(location.mentions);
  }
}

async function linkLocations(locations) {
  for ( const location of locations ) {
    for ( const mention of location.mentions ) {
      await mention.setLocation(location);
    }
  }
}
