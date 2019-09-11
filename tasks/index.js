const requireDir = require('../util/require-dir');
const Logger     = require('../util/logger');

const { natuurbrandrisico,
        createAndLinkLocations,
        updateLocations,
        importers } = requireDir(__filename, __dirname);

module.exports = {
  natuurbrandrisico,
  createAndLinkLocations,
  updateLocations,
  importers
};

module.exports.run = async () => {
  // First, run all importers
  await importers.run();

  // When all importers are done, create and link locations
  await createAndLinkLocations.run();

  // Then, run updateLocations and fetch the fire hazard statuses
  await Promise.all([
    updateLocations.run(),
    natuurbrandrisico.run()
  ]);
}
