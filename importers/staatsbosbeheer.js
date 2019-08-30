// Settings
const description = "Update Staatsbosbeheer locations from their website";
const serviceURL  = "https://www.logerenbijdeboswachter.nl/paalkamperen";
const startTime   = "03:00:00";

// Dependencies
const Request    = require('../util/request');
const taskRunner = require('../util/task-runner');
const parser     = require('node-html-parser');

// Function to query the paalkamperen page
const fetch = (now) => {
  new Request(serviceURL).then((result) => {

    // Parse HTML file
    result = parser.parse(result);

    // Cherry pick the interesting bits
    const name = "Paalkamperen bij Staatsbosbeheer";
    const desc = result.querySelector('div.content').innerHTML;
    const places = result.querySelectorAll('article.visualLink div.content');

    // Output for fun and giggles
    console.log(name);
    console.log(desc);
    places.forEach((p) => {
      console.log(p.querySelector('a.title').text);
      console.log(p.querySelector('div.text').innerHTML);
      console.log(p.querySelector('div.nav a').attributes.href);
    });

  });
}

// Schedule our task
taskRunner.schedule(description, startTime, fetch);

// Make fetch method available for testing
module.exports.fetch = fetch;
