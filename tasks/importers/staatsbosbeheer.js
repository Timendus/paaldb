const Request      = require('../../util/request');
const importHelper = require('../../util/import-helper');
const parser       = require('node-html-parser');
const link         = "https://www.logerenbijdeboswachter.nl/paalkamperen";

// Function to query the Staatsbosbeheer website
module.exports.run = async () => {
  let result = await new Request(link);

  // Parse HTML file
  result = parser.parse(result);

  // Collect source information
  const mail  = result.querySelector('a.email').attributes.href;
  const phone = result.querySelector('a.tel').attributes.href;

  const source = {
    name:        "Staatsbosbeheer",
    description: result.querySelector('div.content').innerHTML,
    contact:     `<a href='${mail}'>${mail.split(':')[1]}</a>, <a href="${phone}">${phone.split(':')[1]}</a>`
  };

  // Collect the locations we mention
  const mentions = result.querySelectorAll('article.visualLink div.content').map((p) => {
    const coordinates = p.querySelector('div.nav a').attributes.href;
    if ( !coordinates ) return {};

    const [_, lat, lon, height] = coordinates.match(/@([\d\.]*),([\d\.]*),(\d*)m/);
    return {
      name:        p.querySelector('a.title').text,
      description: p.querySelector('div.text').innerHTML,
      latitude:    lat,
      longitude:   lon,
      height:      height,
      link:        link
    }
  });

  // Save this data
  await importHelper.save({
    task: __filename,
    source,
    mentions
  });
}
