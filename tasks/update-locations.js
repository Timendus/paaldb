const taskRunner          = require('../util/task-runner');
const Logger              = require('../util/logger');
const roundCoordinate     = require('../util/round-coordinate');
const string              = require('../util/string');
const {Location, Mention} = require('../models');

// Function to update locations
module.exports.run = async () => {
  const locations = await Location.findAll({
    include: [{
      model: Mention
    }]
  });

  let numChanged = 0;

  for ( const location of locations ) {
    if ( location.Mentions.length > 0 ) {
      location.name      = createName(location.Mentions.map(m => m.name));
      location.latitude  = average(location.Mentions.map(m => m.latitude));
      location.longitude = average(location.Mentions.map(m => m.longitude));

      if ( location.changed() ) numChanged++;
      await location.save();
    }
  }

  Logger.log(`Updated fields on ${numChanged} location(s)`);
}

function createName(names) {
  // Strip common prefixes from all names
  names = names.map(n => string.stripName(n));

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
  values = values.filter(n => n);  // Exclude empty
  values = values.map(n => 1 * n); // Cast to numbers
  total = values.reduce((r,v) => r + v, 0);
  return roundCoordinate(total / values.length);
}
