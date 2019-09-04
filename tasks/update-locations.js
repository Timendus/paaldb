// Settings
const name        = "Update locations";
const description = "Update locations from mentions";
const startTime   = "03:00:00";  // Start after task that creates and links locations

// Dependencies
const taskRunner          = require('../util/task-runner');
const Logger              = require('../util/logger');
const {Location, Mention} = require('../models');

// Function to update locations
const update = (now) => {
  Location.findAll({
    include: [{
      model: Mention
    }]
  }).then(locations => {
    numChanged = 0;

    locations.forEach(location => {
      if ( location.Mentions.length == 0 ) return;
      location.name      = createName(location.Mentions.map(m => m.name));
      location.latitude  = average(location.Mentions.map(m => m.latitude));
      location.longitude = average(location.Mentions.map(m => m.longitude));

      // This is terribly sloppy, probably due to rounding of the coordinates
      if ( location.changed() ) numChanged++;
      location.save();
    });

    Logger.log(`Updated fields on ${numChanged} locations`);
  });
}

function createName(names) {
  // Create mapping lowercase name => actual name
  names = names.filter(n => n) // Exclude empty names
               .reduce((o,n) => {
                 o[n.toLowerCase()] = n;
                 return o
               }, {});

  // Are all names the same, ignoring capitalisation?
  if ( Object.keys(names).length == 1 )
    return Object.values(names)[0];

  // Are some names substrings of other names?
  Object.keys(names).forEach(a => {
    Object.keys(names).forEach(b => {
      if ( a == b ) return;
      if ( a.includes(b) ) delete names[b];
    });
  });

  // Otherwise, just show all available names
  return Object.values(names).join(' / ');
}

function average(values) {
  values = values.filter(n => n); // Exclude empty
  total = values.reduce((r,v) => r + v, 0);
  return total / values.length;
}

// Schedule our task
taskRunner.schedule(description, startTime, update);

// Make name and fetch method available to the outside world
module.exports = { name, update };
