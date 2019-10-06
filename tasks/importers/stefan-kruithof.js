const importHelper    = require('../../util/import-helper');
const roundCoordinate = require('../../util/round-coordinate');
const {Mention}       = require('../../models');

// Function to query the map
module.exports.run = async () => {
  // Stefan's map is more up to date and has more locations, but his website has
  // more complete descriptions. So this importer fetches both, and combines the
  // information where possible.
  const map = await importHelper.fetchKML("https://www.google.com/maps/d/kml?forcekml=1&mid=1SdsMhcQBTrVjABZaLXYPJZeOgfA");
  const website = await importHelper.fetchHTML("https://sites.google.com/site/paalkampeerders/system/app/pages/subPages?path=/locatiebeschrijvingen");
  if (!map || !website) return;

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
    const link = `https://sites.google.com${anchor.attributes.href}`;
    const page = await importHelper.fetchHTML(link);
    if (!page) continue;

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
  }

  // Save this data
  await importHelper.save({
    task: __filename,
    source,
    mentions
  });
}
