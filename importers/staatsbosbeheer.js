// Settings
const name        = "Staatsbosbeheer";
const description = "Update Staatsbosbeheer locations from their website";
const serviceURL  = "https://www.logerenbijdeboswachter.nl/paalkamperen";
const startTime   = "03:00:00";

// Dependencies
const Request      = require('../util/request');
const taskRunner   = require('../util/task-runner');
const importHelper = require('../util/import-helper');
const parser       = require('node-html-parser');

// Function to query the paalkamperen page
const fetch = (now) => {
  new Request(serviceURL).then((result) => {

    // Parse HTML file
    result = parser.parse(result);

    // Collect source information
    const mail  = result.querySelector('a.email').attributes.href;
    const phone = result.querySelector('a.tel').attributes.href;

    const source = {
      name:        name,
      description: result.querySelector('div.content').innerHTML,
      contact:     `<a href='${mail}'>${mail.split(':')[1]}</a>, <a href="${phone}">${phone.split(':')[1]}</a>`
    };

    // Collect the locations we mention
    const mentions = result.querySelectorAll('article.visualLink div.content').map((p) => {
      const coordinates = p.querySelector('div.nav a').attributes.href;
      if ( !coordinates ) return {};

      const [_, lat, lon, height] = coordinates.match(/@([\d\.]*),([\d\.]*),(\d*)m/);
      return {
        name: p.querySelector('a.title').text,
        description: p.querySelector('div.text').innerHTML,
        latitude: lat,
        longitude: lon,
        height: height
      }
    });

    // Save this data
    importHelper.save(name, source, mentions);

  });
}

// Schedule our task
taskRunner.schedule(description, startTime, fetch);

// Make fetch method available for testing
module.exports.fetch = fetch;
