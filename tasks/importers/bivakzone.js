// This is clearly the most fragile of the importers. The pages of bivakzone.be
// are really not designed for automated interpretation, and look pretty much
// individually hand-crafted. This importer is therefore very likely to fail
// soon and often, and a proper API would be very much appreciated. However, the
// website contains a large number of locations that few other sources mention,
// so for the time being it's worth the hassle.

const htmlImporter = require('../../util/import-helpers/html');
const root         = "http://www.bivakzone.be";

module.exports = htmlImporter({
  task: __filename,
  url:  `${root}/overzichtskaart.html`,

  // Collect source information
  source: html => {
    const mail  = html.querySelectorAll('.art-footer-text a')[1].attributes.href;

    return {
      name:        "Bivakzone",
      description: "Bivakzone.be biedt het meest volledige overzicht van plekken waar je legaal een nachtje mag bivakkeren met je trekkerstent in Vlaamse of Waalse natuur. We zijn echter van geen enkele van deze bivakzones zelf eigenaar of beheerder. Net als jij trekken we graag af en toe de natuur in om te genieten van een nachtje onder de sterren tijdens een meerdaagse tocht te voet of per fiets. Voor een vraag op opmerking over een bepaalde bivakzone kun je terecht bij de beheerder die bij elke bivakzone vermeld staat...maar eigenlijk zijn we onder het motto 'leave no trace' met zijn allen zelf ook een stukje verantwoordelijk voor het goed beheer in vertrouwen van deze aangename rustplekken in de natuur. Geniet ervan!",
      contact:     `<a href='${mail}'>${mail.split(':')[1]}</a>`
    };
  },

  // Information on the different locations is spread over a lot of pages
  // These are the URLs for the different pages
  mentionUrls: html => html.querySelectorAll('.art-box-body li a')
                           .map(a => a.attributes.href)
                           .map(u => `${root}${u}`),

  // Extract the mention from the page
  mentions: (html, {url}) => {
    const title = html.querySelector('h2');
    const table = html.querySelectorAll('table tbody')
                        .filter(t => t.querySelectorAll('tr').length > 1)
                        .shift();

    // Without a table with at least two rows, this page does not contain (a) mention(s)
    if ( !table ) return [];

    // Find a description of the place(s)
    const description = html.querySelectorAll('h4')
                              .filter(t => t.text.split(/\s+/).length > 6) // More than 6 words
                              .map(t => t.text)
                              .join(' ');

    // Get the file names of the images in the bottom row of the table for the properties
    const images = table.querySelectorAll('tr')
                        .pop()
                        .querySelectorAll('img')
                        .map(i => i.attributes.src);

    // With a title 'Bivakzone: name' or 'Aire de Bivouac name', this is a single mention
    if ( title && title.text && (title.text.startsWith('Bivakzone:') || title.text.startsWith('Aire de Bivouac')) ) {

      // Get the value for the row that says 'WGS84'
      const [lat, lon] = table.querySelectorAll('tr')
                              .filter(tr => tr.querySelector('td span strong').text == 'WGS84')
                              .shift()
                              .querySelectorAll('td span')
                              .pop()
                              .text.trim()
                              .split(/\s+/);

      return [createMention({
        name: title.text.trim(),
        link: url,
        table, lat, lon, description, images
      })];
    }

    // Otherwise, this page contains multiple mentions
    const mentions = [];
    const rows = table.querySelectorAll('tr')
                      .filter(tr => tr.querySelector('td').attributes.style == "text-align: left;");

    rows.forEach(row => {
      // Find the coordinates in the fourth column
      const [lat, lon] = row.querySelectorAll('td')[3]
                            .text.trim()
                            .split(/\s+/);

      mentions.push(createMention({
        name: row.querySelector('td strong').text.trim(),
        lat:  lat.trim(),
        lon:  lon.trim(),
        link: url,
        table, description, images
      }));
    });

    return mentions;
  }
});

function createMention({name, table, lat, lon, link, description, images}) {
  return {
    name, description, link,
    latitude:    lat,
    longitude:   lon,

    properties: {
      hasShelter:             images.some(i => i.includes('icoonshelter')),
      accessibleWithBicycle:  images.some(i => i.includes('toegangfietser')),
      fireAllowed:           !images.some(i => i.includes('verbodvuur')),
      hasWaterPump:          !images.some(i => i.includes('geenpomp')),
      dogsOnLeashAllowed:    !images.some(i => i.includes('verbodhonden')),
      isNextToRiver:          images.some(i => i.includes('icoonrivier'))
    }
  };
}
