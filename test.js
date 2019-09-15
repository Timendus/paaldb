/** Running individual tasks **/


const { natuurbrandrisico,
        createAndLinkLocations,
        updateLocations,
        importers } = require('./tasks');

(async function() {
  // await importers.bivakzone.run();
  // await importers.communityWalk.run();
  // await importers.kampeermeneer.run();
  // await importers.staatsbosbeheer.run();
  // await importers.stefanKruithof.run();
  // await importers.udinaturen.run();
  // await importers.vindskyddskartan.run();
  // await importers.wildKamperen.run();
  //
  // await importers.run();
  //
  // await createAndLinkLocations.run();
  // await updateLocations.run();
  //
  // await natuurbrandrisico.run();

  console.log("Done!");
})();


/** Running everything **/


// tasks = require('./tasks');
// tasks.run().then(() => console.log('Done'));
