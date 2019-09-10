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
  // First, run all impoters
  await Promise.all(
    Object.values(importers).map(i => i.run())
  );

  // When all impoters are done, create and link locations
  await createAndLinkLocations.run();

  // Then, run updateLocations and fetch the natuurbrandrisico's for each location
  await Promise.all([
    updateLocations.run(),
    natuurbrandrisico.run()
  ]);
}
