const importHelper = require('../../util/import-helper');
const htmlParser   = require('node-html-parser');
const {Mention}    = require('../../models');

// Function to query the map
module.exports.run = async () => {
  const result = await importHelper.fetchKML("https://www.wild-kamperen.nl/wp-content/plugins/leaflet-maps-marker/leaflet-kml.php?layer=1&name=show");
  if (!result) return;

  // Collect source information
  const source = {
    name:        "Stichting wildkamperen",
    description: "Dankzij jou zijn wij instaat om creatieve, informatieve en inspirerende outdoorcontent te (blijven) maken. Zo testen wij bivakzones & paalkampeerplaatsen zodat jij weet waar je back to basic kunt verblijven. We lobbyen actief voor meer locaties en adviseren particulieren en organisaties hoe ze de ideale verblijfslocatie kunnen inrichten. Daarnaast reviewen wij outdoorproducten en delen wij technieken. Tot slot zetten wij ons in voor het belang van natuureducatie, dit doen wij oa. door het aanbieden van laagdrempelige workshops.",
    contact:     "<a href='https://www.wild-kamperen.nl/contact/'>Contactformulier stichting wild-kamperen.nl</a>"
  };

  // Collect the locations we mention
  const mentions = result.kml.Document.Folder.Placemark.map(p => {
    const [lon, lat] = p.Point.coordinates._text.split(',');

    const html = htmlParser.parse(p.description._cdata);
    let link = html.querySelector('a');
    link = link ? link.attributes.href : null;

    return {
      name:        p.name._text,
      latitude:    lat,
      longitude:   lon,
      status:      p.styleUrl._text == '#blank_red' ? Mention.status.STALE : Mention.status.ACTIVE,
      description: p.description._cdata,
      link:        link,

      properties: {
        hasShelter: p.styleUrl._text == '#home'
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
