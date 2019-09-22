const Request      = require('../../util/request');
const importHelper = require('../../util/import-helper');
const convert      = require('xml-js');
const {Mention}    = require('../../models');

// Function to query the map
module.exports.run = async () => {
  let result = await new Request("https://www.google.com/maps/d/kml?forcekml=1&mid=1SdsMhcQBTrVjABZaLXYPJZeOgfA");

  // Parse KML file
  result = convert.xml2js(result, {
    compact:           true,
    ignoreDeclaration: true,
    ignoreAttributes:  true,
    trim:              true
  });

  // Collect source information
  const source = {
    name:        "Stefan Kruithof",
    description: result.kml.Document.description._cdata,
    contact:     "<a href='mailto:stefankruithof@gmail.com'>stefankruithof@gmail.com</a>"
  };

  // Collect the locations we mention
  const mentions = result.kml.Document.Folder.Placemark.map((p) => {
    const [lon, lat] = p.Point.coordinates._text.split(',');

    return {
      name:        p.name._text,
      latitude:    lat,
      longitude:   lon,
      status:      p.styleUrl._text == '#icon-1125' ? Mention.status.STALE : Mention.status.ACTIVE,
      description: p.description ? p.description._cdata : null,

      properties: {
        hasShelter: p.styleUrl._text == '#icon-117'
      }
    }
  });

  // Save this data
  await importHelper.save({
    task: __filename,
    source,
    mentions
  });
}
