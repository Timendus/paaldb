// Settings
const name        = "CommunityWalk";
const description = "Update map from CommunityWalk / Rugzaklopers";
const serviceURL  = "http://www.communitywalk.com/xml/kml/14583";
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
      description: "Camping database met ondermeer campings welke bezocht zijn tijdens weekenden van de Vereniging de Rugzaklopers. Het doel van deze database is het verzamelen van campings waar mensen met trekkerstenten zich welkom voelen in de breedste zin van het woord, waar men kan kamperen op een bekende trektocht en/of men lekker in de natuur kan kamperen zonder gestoord te worden door een haag van witte dozen. Beheer door: Ondermeer een handjevol enthousiaste leden van de Vereniging de Rugzaklopers",
      contact:     "<a href='https://www.rugzaklopers.nl/contact/'>Contactformulier vereniging Rugzaklopers</a>"
    };

    // Collect the locations we mention
    const mentions = result.kml.Document.Folder.Folder.filter(f => f.name._text == 'Paalkampeerplaats').shift().Placemark.map((p) => {
      const [lon, lat] = p.Point.coordinates._text.split(',');

      return {
        name:        p.name._text,
        latitude:    lat,
        longitude:   lon,
        description: p.description._text
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
