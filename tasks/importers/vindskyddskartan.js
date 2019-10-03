const Request         = require('../../util/request');
const importHelper    = require('../../util/import-helper');
const roundCoordinate = require('../../util/round-coordinate');
const parser          = require('xml-js');
const {Mention}       = require('../../models');

// Function to query the map
module.exports.run = async () => {
  let result = await new Request("https://www.google.com/maps/d/kml?forcekml=1&mid=1doLXXvokOtiMzthVz0SLFjEPmD4");

  // Parse KML file
  result = parser.xml2js(result, {
    compact:           true,
    ignoreDeclaration: true,
    ignoreAttributes:  true,
    trim:              true
  });

  // Collect source information
  const source = {
    name:        "Vindskyddskartan Sverige",
    description: "Zweedse kaart van alle shelters in Zweden. In Zweden mag immers overal wild gekampeerd worden, maar niet overal is een shelter met een vuurplaats. Communitykaart van een Facebookgroep.",
    contact:     "<a href='https://www.facebook.com/groups/vindskyddinorden/'>De Facebookgroep van Vindskyddskartan</a>"
  };

  let placemarks = result.kml.Document.Folder.map(f => f.Placemark);
  placemarks = [].concat.apply([], placemarks); // Flatten

  // Collect the locations we mention
  const mentions = placemarks.map(p => {
    const [lon, lat] = p.Point.coordinates._text.split(',');

    return {
      externalId:  `${source.name}-${roundCoordinate(lat, 4)}-${roundCoordinate(lon, 4)}`,
      name:        p.name._text,
      latitude:    lat,
      longitude:   lon,
      description: p.description ? (p.description._cdata || p.description._text) : '',

      properties: {
        hasShelter: p.styleUrl._text == '#icon-1197'
        // isUnconfirmed: p.styleUrl._text == '#icon-503-DB4436-nodesc'
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
