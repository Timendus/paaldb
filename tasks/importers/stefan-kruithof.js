// Settings
const name        = "Stefan Kruithof";
const description = "Update paalkampeerders map from Stefan Kruithof's Google site";
const serviceURL  = "https://www.google.com/maps/d/kml?forcekml=1&mid=1SdsMhcQBTrVjABZaLXYPJZeOgfA";
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
      description: result.kml.Document.description._cdata,
      contact:     "<a href='mailto:stefankruithof@gmail.com'>stefankruithof@gmail.com</a>"
    };

    // Collect the locations we mention
    const mentions = result.kml.Document.Folder.Placemark.map((p) => {
      const [lon, lat] = p.Point.coordinates._text.split(',');

      // Stefan uses different icons to indicate different locations
      const stale   = p.styleUrl._text == '#icon-1125';
      const shelter = p.styleUrl._text == '#icon-117';

      return {
        name:        p.name._text,
        latitude:    lat,
        longitude:   lon,
        status:      stale ? Mention.status.STALE : Mention.status.ACTIVE
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
