const Logger              = require('../util/logger');
const {Location, Mention} = require('../models');

const { natuurbrandrisico,
        createAndLinkLocations,
        updateLocations } = require('../tasks');

(async function() {

  Logger.log("Reset locations: Unlinking all Mentions");

  mentions = await Mention.findAll();
  for ( const mention of mentions ) {
    await mention.setLocation(null);
  }

  Logger.log("Reset locations: Removing all locations");

  await Location.destroy({ where: {} });

  Logger.log("Reset locations: Creating and linking new locations");

  await createAndLinkLocations.run();
  await updateLocations.run();

  Logger.log("Reset locations: Done relinking. Updating fire hazard status");

  await natuurbrandrisico.run();

  Logger.log("Resetting locations done. You can now safely exit this process (Ctrl+C)");

})();
