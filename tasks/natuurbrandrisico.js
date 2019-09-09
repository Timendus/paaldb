const Request = require('../util/request');

module.exports.run = () => {
  return new Request(`https://www.natuurbrandrisico.nl/maps/script_all_regios.js?ts=${Date.now().valueOf()}`)
  .then(result => {

    // Cut off the parts that aren't JSON
    result = result.substring("NBR.RegionsDefinition = ".length);
    result = result.substring(0, result.length - 1);

    // Parse the rest
    result = JSON.parse(result);

    // Output for fun and giggles
    result.forEach(r => {
      console.log(r.name);
    });

  });
}
