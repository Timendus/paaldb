const Request         = require('../../util/request');
const Logger          = require('../../util/logger');
const importHelper    = require('../../util/import-helper');
const roundCoordinate = require('../../util/round-coordinate');
const {Mention}       = require('../../models');
const parser          = require('node-html-parser');
const convert         = require('xml-js');

// Function to query the map
module.exports.run = async () => {

  // Stefan's map is more up to date
  let map = await new Request("https://www.google.com/maps/d/kml?forcekml=1&mid=1SdsMhcQBTrVjABZaLXYPJZeOgfA");
  // But his website has more information
  let website = await new Request("https://sites.google.com/site/paalkampeerders/system/app/pages/subPages?path=/locatiebeschrijvingen");

  // Parse KML file
  map = convert.xml2js(map, {
    compact:           true,
    ignoreDeclaration: true,
    ignoreAttributes:  true,
    trim:              true
  });

  // Parse HTML file
  website = parser.parse(website);

  // Collect source information
  const source = {
    name:        "Stefan Kruithof",
    description: map.kml.Document.description._cdata,
    contact:     "<a href='mailto:stefankruithof@gmail.com'>stefankruithof@gmail.com</a>"
  };

  // Collect the locations we mention from the map
  const mentions = [];
  for ( const p of map.kml.Document.Folder.Placemark ) {
    const [lon, lat] = p.Point.coordinates._text.split(',');

    mentions.push({
      name:        p.name._text,
      latitude:    lat,
      longitude:   lon,
      status:      p.styleUrl._text == '#icon-1125' ? Mention.status.STALE : Mention.status.ACTIVE,
      description: p.description ? p.description._cdata : null,

      properties: {
        hasShelter: p.styleUrl._text == '#icon-117'
      }
    });
  }

  // Add links and descriptions to mentions from the website
  for ( const anchor of website.querySelectorAll('.sites-table a') ) {
    try {
      const link = `https://sites.google.com${anchor.attributes.href}`;
      const page = parser.parse(await new Request(link));

      // Take the page content, remove the messy top table
      const content     = page.querySelector('.sites-tile-name-content-1 div').innerHTML;
      const table       = page.querySelector('.sites-tile-name-content-1 div div').outerHTML;
      const description = content.substr(table.length);

      // Find something that matches coordinates anywhere in the page :/
      const coordinates = content.match(/\d\d\.\d{3,8},\s+\d\.\d{3,8}/)[0];
      const [lat, lon]  = coordinates.split(', ');

      // Find the matching mention by rounded coordinates
      const mention = mentions.find(m =>
        roundCoordinate(m.latitude,  3) == roundCoordinate(lat, 3) &&
        roundCoordinate(m.longitude, 3) == roundCoordinate(lon, 3)
      );
      if ( !mention ) continue;

      // Add these properties to the mention
      mention.link        = link;
      mention.description = description;
    } catch (error) {
      Logger.error(error);
    }
  }

  // Save this data
  await importHelper.save({
    task: __filename,
    source,
    mentions
  });
}
