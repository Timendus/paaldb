const Logger = require('../util/logger');

const { natuurbrandrisico,
        createAndLinkLocations,
        updateLocations,
        importers } = require('../tasks');

(async function() {

  Logger.log("Test file: Running stuff");

  //// Uncomment task(s) to run

  //// Indivitual importers:
  // await importers.bivakzone.run();
  // await importers.communityWalk.run();
  // await importers.kampeermeneer.run();
  // await importers.staatsbosbeheer.run();
  // await importers.stefanKruithof.run();
  // await importers.udinaturen.run();
  // await importers.vindskyddskartan.run();
  // await importers.wildKamperen.run();

  //// All importers:
  // await importers.run();

  //// Creating, linking, updating locations:
  // await createAndLinkLocations.run();
  // await updateLocations.run();

  //// Setting fireHazard status on locations
  // await natuurbrandrisico.run();

  Logger.log("Test file done. You can now safely exit this process (Ctrl+C)");

})();
