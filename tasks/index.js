const requireDir = require('../util/require-dir');
const Logger     = require('../util/logger');

const { natuurbrandrisico,
        createAndLinkLocations,
        updateLocations,
        importers } = requireDir(__filename, __dirname);

module.exports.run = () => {
  return new Promise((resolve, reject) => {

    // First, run all impoters
    Promise.all(
      Object.values(importers).map(i => i.run())
    )

    // When all impoters are done, create and link locations
    .then(() => {
      createAndLinkLocations.run()

      // Then, run updateLocations and fetch the natuurbrandrisico's for each location
      .then(() => {
        Promise.all([
          updateLocations.run(),
          natuurbrandrisico.run()
        ])

        // And we're done
        .then(() => resolve());
      });
    })

    // What to do when things go wrong..?
    .catch(error => {
      Logger.error(`Woops, one of our tasks misbehaved! ${error}`);

      // But the show must go on
      resolve();
    });
  });
}
