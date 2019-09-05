// Settings
const name        = "Kampeermeneer";
const description = "Update paalkampeerplaatsen map from Kampeermeneer's website";
const serviceURL  = "https://www.google.com/maps/d/kml?forcekml=1&mid=1OCxFeZMcMmjt_p-p0YV-aLR-pmrIxinB";
const startTime   = "02:00:00";

// Dependencies
const Request      = require('../../util/request');
const taskRunner   = require('../../util/task-runner');
const importHelper = require('../../util/import-helper');
const {Mention}    = require('../../models');
const convert      = require('xml-js');

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

    // Collect source information
    const source = {
      name:        name,
      description: result.kml.Document.description._text,
      contact:     "<a href='https://www.kampeermeneer.nl/kampeerblog/'>Contactformulier Kampeermeneer</a>"
    };

    // Collect the locations we mention
    const mentions = result.kml.Document.Folder.Placemark.map((p) => {
      const [lon, lat] = p.Point.coordinates._text.split(',');

      return {
        name:        p.name._text,
        latitude:    lat,
        longitude:   lon
      }
    });

    // Save this data
    importHelper.save(name, source, mentions);

  });
}

// Schedule our task
taskRunner.schedule(description, startTime, fetch);

// Make name and fetch method available to the outside world
module.exports = { name, fetch };
