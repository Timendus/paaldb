const Logger              = require('../util/logger');
const {Location, Mention} = require('../models');

const { natuurbrandrisico,
        createAndLinkLocations,
        updateLocations } = require('../tasks');

(async function() {

  Logger.log("Relink: Unlinking all Mentions");

  mentions = await Mention.findAll();
  for ( const mention of mentions ) {
    await mention.setLocation(null);
  }

  Logger.log("Relink: Relinking mentions to locations according to new logic");

  await createAndLinkLocations.run();
  await updateLocations.run();

  Logger.log("Relink: Regrouping may have moved locations. Creating and linking new locations once more");

  mentions = await Mention.findAll();
  for ( const mention of mentions ) {
    await mention.setLocation(null);
  }

  await createAndLinkLocations.run();
  await updateLocations.run();

  Logger.log("Relink: Done relinking, I hope. Updating fire hazard status");

  await natuurbrandrisico.run();

  Logger.log("Relinking done. You can now safely exit this process (Ctrl+C)");

})();
