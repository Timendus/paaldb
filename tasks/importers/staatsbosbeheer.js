const htmlImporter = require('../../util/import-helpers/html');
const link         = "https://www.logerenbijdeboswachter.nl/paalkamperen";

// Function to query the Staatsbosbeheer website
module.exports = htmlImporter({
  task: __filename,
  url:  link,

  // Collect source information
  source: html => {
    const mail  = html.querySelector('a.email').attributes.href;
    const phone = html.querySelector('a.tel').attributes.href;

    return {
      name:        "Staatsbosbeheer",
      description: html.querySelector('div.content').innerHTML,
      contact:     `<a href='${mail}'>${mail.split(':')[1]}</a>, <a href="${phone}">${phone.split(':')[1]}</a>`
    };
  },

  // Collect the locations we mention
  mentions: html => html.querySelectorAll('article.visualLink div.content').map((p) => {
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
  })
});
