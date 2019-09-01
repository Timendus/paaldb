// Settings
const name        = "Natuurbrandrisico";
const description = "Update fire hazard status for all Dutch regions";
const serviceURL  = "https://www.natuurbrandrisico.nl/maps/script_all_regios.js";
const startTime   = "03:00:00";

// Dependencies
const Request    = require('../util/request');
const taskRunner = require('../util/task-runner');

// Function to query fire hazard status from natuurbrandrisico.nl
const fetch = (now) => {
  new Request(`${serviceURL}?ts=${now.valueOf()}`).then((result) => {

    // Cut off the parts that aren't JSON
    result = result.substring("NBR.RegionsDefinition = ".length);
    result = result.substring(0, result.length - 1);

    // Parse the rest
    result = JSON.parse(result);

    // Output for fun and giggles
    result.forEach((r) => {
      console.log(r.name);
    });

  });
}

// Schedule our task
taskRunner.schedule(description, startTime, fetch);

// Make name and fetch method available to the outside world
module.exports = { name, fetch };
