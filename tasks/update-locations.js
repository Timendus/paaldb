// Settings
const name        = "Update locations";
const description = "Create and update locations from mentions";
const startTime   = "02:30:00";

// Dependencies
const taskRunner          = require('../util/task-runner');
const {Location, Mention} = require('../models');

// Function to create and update locations
const update = (now) => {
  const m = Mention.findAll({
    include: [{
      model: Location
    }]
  });

  const l = Location.findAll();

  Promise.all([m, l]).then(([mentions, locations]) => {

    // Find the right location for each mention, or create a new one
    promises = [];
    mentions.forEach(mention => {
      promises.push(mention.getLocation().then(location => {
        if ( !location ) {
          location = Location.findNearestInMemory({
            locations: locations,
            latitude:  mention.latitude,
            longitude: mention.longitude
          });

          if ( location && location.distance < 0.005 ) {
            // mention.setLocation(location);
            location.mentions ||= [];
            location.mentions.push(mention);
          } else {
            locations.push({
              name: mention.name,
              latitude: mention.latitude,
              longitude: mention.longitude,
              mentions: [mention]
            });
          }
        }
      }));
    });

    Promise.all(promises).then(() => {
      console.log(locations.length);

      // Store all Locations
      // TODO: don't re-create existing locations!
      Location.bulkCreate(locations, {returning: true, individualHooks: true})
      .then(locationObjs => {
        // TODO: Map locations to locationObjs, find mentions, update mentions
      })
    });
  });
}

// Schedule our task
taskRunner.schedule(description, startTime, update);

// Make name and fetch method available to the outside world
module.exports = { name, update };
