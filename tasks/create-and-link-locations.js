const taskRunner          = require('../util/task-runner');
const Logger              = require('../util/logger');
const {Location, Mention} = require('../models');

// Function to create and link locations
module.exports.run = () => {
  return new Promise((resolve, reject) => {
    const mp = Mention.findAll({
      include: [{
        model: Location
      }]
    });

    const lp = Location.findAll();

    Promise.all([mp, lp]).then(([mentions, locations]) => {
      const {locationsToCreate, locationsToLink} = findLocations(locations, mentions);

      console.log("Still here!");

      createLocations(locationsToCreate).then(() => {
        console.log("Not here anymore");
        linkLocations(locationsToLink).then(() => {
          console.log("And here");
          Logger.log(`Created ${locationsToCreate.length} new locations and linked ${locationsToLink.length} locations to new mentions`);
          resolve();
        });
      });
    })

    .catch(error => {
      reject(error);
    });
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
  return Promise.all(
    locations.map(location => {
      Location.create(location)
      .then(record => {
        record.setMentions(location.mentions);
        return record.save();
      });
    })
  );
}

function linkLocations(locations) {
  return Promise.all(locations.map(location => {
    location.setMentions(location.mentions);
    return location.save();
  }));
}
