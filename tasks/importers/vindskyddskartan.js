const xmlImporter     = require('../../util/import-helpers/xml');
const roundCoordinate = require('../../util/round-coordinate');

// Function to query the map
module.exports = xmlImporter({
  task: __filename,
  url:  "https://www.google.com/maps/d/kml?forcekml=1&mid=1doLXXvokOtiMzthVz0SLFjEPmD4",

  // Collect source information
  source: () => ({
    name:        "Vindskyddskartan Sverige",
    description: "Zweedse kaart van alle shelters in Zweden. In Zweden mag immers overal wild gekampeerd worden, maar niet overal is een shelter met een vuurplaats. Communitykaart van een Facebookgroep.",
    contact:     "<a href='https://www.facebook.com/groups/vindskyddinorden/'>De Facebookgroep van Vindskyddskartan</a>"
  }),

  // Collect the locations we mention
  mentions: (xml, source) => {
    let placemarks = xml.kml.Document.Folder.map(f => f.Placemark);
    placemarks = [].concat.apply([], placemarks); // Flatten

    return placemarks.map(p => {
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
  }
});
