const importHelper = require('../../util/import-helper');

// Function to query the map
module.exports.run = async () => {
  const result = await importHelper.fetchKML("http://www.communitywalk.com/xml/kml/14583");
  if (!result) return;

  // Collect source information
  const source = {
    name:        "CommunityWalk",
    description: "Camping database met ondermeer campings welke bezocht zijn tijdens weekenden van de Vereniging de Rugzaklopers. Het doel van deze database is het verzamelen van campings waar mensen met trekkerstenten zich welkom voelen in de breedste zin van het woord, waar men kan kamperen op een bekende trektocht en/of men lekker in de natuur kan kamperen zonder gestoord te worden door een haag van witte dozen. Beheer door: Ondermeer een handjevol enthousiaste leden van de Vereniging de Rugzaklopers",
    contact:     "<a href='https://www.rugzaklopers.nl/contact/'>Contactformulier vereniging Rugzaklopers</a>"
  };

  // Collect the locations we mention
  const mentions = result.kml.Document.Folder.Folder
                   .filter(f => f.name._text == 'Paalkampeerplaats')
                   .shift()
                   .Placemark
                   .map((p) => {

    const [lon, lat] = p.Point.coordinates._text.split(',');

    return {
      name:        p.name._text,
      latitude:    lat,
      longitude:   lon,
      description: p.description._text
    }
  });

  // Save this data
  await importHelper.save({
    task: __filename,
    source,
    mentions
  });
}
