const xmlImporter = require('../../util/import-helpers/xml');

module.exports = xmlImporter({
  task: __filename,
  url:  "https://www.google.com/maps/d/kml?forcekml=1&mid=1OCxFeZMcMmjt_p-p0YV-aLR-pmrIxinB",

  // Collect source information
  source: xml => ({
    name:        "Kampeermeneer",
    description: xml.kml.Document.description._text,
    contact:     "<a href='https://www.kampeermeneer.nl/kampeerblog/'>Contactformulier Kampeermeneer</a>"
  }),

  // Collect the locations we mention
  mentions: xml => xml.kml.Document.Folder.Placemark.map((p) => {
    const [lon, lat] = p.Point.coordinates._text.split(',');

    return {
      name:        p.name._text,
      latitude:    lat,
      longitude:   lon
    }
  })
});
