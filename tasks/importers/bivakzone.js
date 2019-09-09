// This is clearly the most fragile of the importers. The pages of bivakzone.be
// are really not designed for automated interpretation, and look pretty much
// individually hand-crafted. This importer is therefore very likely to fail
// soon and often, and a proper API would be very much appreciated. However, the
// website contains a large number of locations that few other sources mention,
// so for the time being it's worth the hassle.

const Request      = require('../../util/request');
const importHelper = require('../../util/import-helper');
const parser       = require('node-html-parser');
const root         = "http://www.bivakzone.be";

// Function to query bivakzone.be
module.exports.run = () => {
  return new Request(`${root}/overzichtskaart.html`)
  .then(result => {

    // Parse HTML file
    result = parser.parse(result);

    // Collect source information
    const mail  = result.querySelectorAll('.art-footer-text a')[1].attributes.href;

    const source = {
      name:        "Bivakzone",
      description: "Bivakzone.be biedt het meest volledige overzicht van plekken waar je legaal een nachtje mag  bivakkeren met je trekkerstent in Vlaamse of Waalse natuur. We zijn echter van geen enkele van deze bivakzones zelf eigenaar of beheerder. Net als jij trekken we graag af en toe de natuur in om te genieten van een nachtje onder de sterren tijdens een meerdaagse tocht te voet of per fiets. Voor een vraag op opmerking over een bepaalde bivakzone kun je terecht bij de beheerder die bij elke bivakzone vermeld staat...maar eigenlijk zijn we onder het motto 'leave no trace' met zijn allen zelf ook een stukje verantwoordelijk voor het goed beheer in vertrouwen van deze aangename rustplekken in de natuur. Geniet ervan!",
      contact:     `<a href='${mail}'>${mail.split(':')[1]}</a>`
    };

    // Information on the different locations is spread over a lot of pages
    // Collect the request promises for the different pages
    const pages = result.querySelectorAll('.art-box-body li a')
                        .map(p => new Request(`${root}${p.attributes.href}`));

    return Promise.all(pages).then(results => {

      const mentions = [];
      results.forEach(result => {

        // Parse HTML file
        result = parser.parse(result);

        const title = result.querySelector('h2');
        const table = result.querySelectorAll('table tbody')
                            .filter(t => t.querySelectorAll('tr').length > 1)
                            .shift();

        // Without a table with at least two rows, this page does not contain (a) mention(s)
        if ( !table ) return;

        // With a title 'Bivakzone: name', this is a single mention
        if ( title && title.text && title.text.startsWith('Bivakzone:') ) {

          // Get the value for the row that says 'WGS84'
          const [lat, lon] = table.querySelectorAll('tr')
                                  .filter(tr => tr.querySelector('td span strong').text == 'WGS84')
                                  .map(tr => tr.querySelectorAll('td span')[1].text.split(' '))
                                  .shift();

          mentions.push({
            name: title.text.substr('Bivakzone:'.length).trim(),
            latitude: lat,
            longitude: lon
          });

          // Done with this page!
          return;
        }

        // Otherwise, this page contains multiple mentions
        const rows = table.querySelectorAll('tr')
                          .filter(tr => tr.querySelector('td').attributes.style == "text-align: left;");

        rows.forEach(row => {
          // Find the coordinates in the fourth column
          const [lat, lon] = row.querySelectorAll('td')[3].text.trim().split(' ');

          mentions.push({
            name: row.querySelector('td strong').text.trim(),
            latitude: lat.trim(),
            longitude: lon.trim()
          });
        })

      });

      // Save this data
      return importHelper.save({
        task: __filename,
        source,
        mentions
      });

    });

  });
}
