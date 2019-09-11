const Request      = require('../../util/request');
const importHelper = require('../../util/import-helper');
const parser       = require('xml-js');
const {Mention}    = require('../../models');

// Function to query the map
module.exports.run = async () => {
  let result = await new Request("https://www.wild-kamperen.nl/wp-content/plugins/leaflet-maps-marker/leaflet-kml.php?layer=1&name=show");

  // Parse KML file
  result = parser.xml2js(result, {
    compact:           true,
    ignoreDeclaration: true,
    ignoreAttributes:  true,
    trim:              true
  });

  // Collect source information
  const source = {
    name:        "Stichting wildkamperen",
    description: "Dankzij jou zijn wij instaat om creatieve, informatieve en inspirerende outdoorcontent te (blijven) maken. Zo testen wij bivakzones & paalkampeerplaatsen zodat jij weet waar je back to basic kunt verblijven. We lobbyen actief voor meer locaties en adviseren particulieren en organisaties hoe ze de ideale verblijfslocatie kunnen inrichten. Daarnaast reviewen wij outdoorproducten en delen wij technieken. Tot slot zetten wij ons in voor het belang van natuureducatie, dit doen wij oa. door het aanbieden van laagdrempelige workshops.",
    contact:     "<a href='https://www.wild-kamperen.nl/contact/'>Contactformulier stichting wild-kamperen.nl</a>"
  };

  // Collect the locations we mention
  const mentions = result.kml.Document.Folder.Placemark.map(p => {
    const [lon, lat] = p.Point.coordinates._text.split(',');

    // wild-kamperen.nl uses different icons to indicate different locations
    const stale   = p.styleUrl._text == '#blank_red';
    const shelter = p.styleUrl._text == '#home';

    return {
      name:        p.name._text,
      latitude:    lat,
      longitude:   lon,
      status:      stale ? Mention.status.STALE : Mention.status.ACTIVE,
      description: p.description._cdata
    }
  });

  // Save this data
  await importHelper.save({
    task: __filename,
    source,
    mentions
  });
}
