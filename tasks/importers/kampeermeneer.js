const Request      = require('../../util/request');
const importHelper = require('../../util/import-helper');
const convert      = require('xml-js');
const {Mention}    = require('../../models');

// Function to query the map
module.exports.run = () => {
  return new Request("https://www.google.com/maps/d/kml?forcekml=1&mid=1OCxFeZMcMmjt_p-p0YV-aLR-pmrIxinB")
  .then(result => {

    // Parse KML file
    result = convert.xml2js(result, {
      compact:           true,
      ignoreDeclaration: true,
      ignoreAttributes:  true,
      trim:              true
    });

    // Collect source information
    const source = {
      name:        "Kampeermeneer",
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
    return importHelper.save({
      task: __filename,
      source,
      mentions
    });

  });
}
