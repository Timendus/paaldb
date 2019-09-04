// Settings
const name        = "Create and link locations";
const description = "Create locations and link to mentions";
const startTime   = "02:30:00";  // Start after tasks that create mentions

// Dependencies
const taskRunner          = require('../util/task-runner');
const Logger              = require('../util/logger');
const {Location, Mention} = require('../models');

// Function to create and link locations
const update = (now) => {
  const mp = Mention.findAll({
    include: [{
      model: Location
    }]
  });

  const lp = Location.findAll();

  Promise.all([mp, lp]).then(([mentions, locations]) => {
    const {locationsToCreate, locationsToLink} = findLocations(locations, mentions);

    createLocations(locationsToCreate);
    linkLocations(locationsToLink);

    Logger.log(`Created ${locationsToCreate.length} new locations and linked ${locationsToLink.length} locations to new mentions`);
  });
}

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
    const location = Location.findNearestInMemory({
      locations: locations.concat(locationsToCreate),
      latitude:  mention.latitude,
      longitude: mention.longitude
    });

    // Is the location close enough? Then link it
    if ( location && location.distance < 0.005 ) {
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

function createLocations(locations) {
  locations.forEach(location => {
    Location.create(location).then(record => {
      record.setMentions(location.mentions);
      record.save();
    });
  });
}

function linkLocations(locations) {
  locations.forEach(location => {
    location.setMentions(location.mentions);
    location.save();
  });
}

// Schedule our task
taskRunner.schedule(description, startTime, update);

// Make name and fetch method available to the outside world
module.exports = { name, update };
