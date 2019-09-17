const Logger              = require('../util/logger');
const {Location, Mention} = require('../models');

const { createAndLinkLocations,
        updateLocations } = require('../tasks');

(async function() {

  Logger.log("Relink: Unlinking all Mentions");

  mentions = await Mention.findAll();
  for ( const mention of mentions ) {
    await mention.setLocation(null);
  }

  Logger.log("Relink: Removing all Locations");

  await Location.destroy({ where: {} });

  Logger.log("Relink: Creating and linking new locations");

  await createAndLinkLocations.run();
  await updateLocations.run();
  await natuurbrandrisico.run();

  Logger.log("Relinking done. You can now safely exit this process (Ctrl+C)");

})();
