// Settings
const description = "Update paalkampeerders map from Stefan's Google site";
const serviceURL  = "https://www.google.com/maps/d/kml?forcekml=1&mid=1SdsMhcQBTrVjABZaLXYPJZeOgfA";
const startTime   = "03:00:00";

// Dependencies
const Request    = require('../util/request');
const taskRunner = require('../util/task-runner');
const convert    = require('xml-js');

// Function to query the map
const fetch = (now) => {
  new Request(serviceURL).then((result) => {

    // Parse KML file
    result = convert.xml2js(result, {
      compact:           true,
      ignoreDeclaration: true,
      ignoreAttributes:  true,
      trim:              true
    });

    // Cherry pick the interesting bits
    const name = result.kml.Document.name._text;
    const desc = result.kml.Document.description._cdata;
    const places = result.kml.Document.Folder.Placemark;

    // Output for fun and giggles
    console.log(name);
    console.log(desc);
    places.forEach((p) => {
      console.log(p.name._text, p.styleUrl._text, p.Point.coordinates._text);
    });

  });
}

// Schedule our task
taskRunner.schedule(description, startTime, fetch);

// Make fetch method available for testing
module.exports.fetch = fetch;
