const Logger = require('../util/logger');

const {
  Location,
  Mention,
  MentionProperty
} = require('../models');

const {
  natuurbrandrisico,
  createAndLinkLocations,
  updateLocations,
  importers
} = require('../tasks');

(async function() {

  Logger.log("Reset mentions: Deleting all Mentions");

  await MentionProperty.destroy({ where: {} });
  await Mention.destroy({ where: {} });

  Logger.log("Reset mentions: Importing new mentions");

  await importers.run();

  Logger.log("Reset mentions: Linking and updating locations to new mentions");

  await createAndLinkLocations.run();
  await updateLocations.run();

  Logger.log("Reset mentions: Done relinking. Updating fire hazard status");

  await natuurbrandrisico.run();

  Logger.log("Resetting mentions done. You can now safely exit this process (Ctrl+C)");

})();
