// const { natuurbrandrisico,
//         createAndLinkLocations,
//         updateLocations,
//         importers } = require('./tasks');


staatsbosbeheer = require('./tasks/importers/staatsbosbeheer');
natuurbrandrisico = require('./tasks/natuurbrandrisico');
wildKamperen = require('./tasks/importers/wild-kamperen');

natuurbrandrisico.run().then(() => {
  wildKamperen.run().then(() => {
    console.log("All done!");
  });
});

// importers.stefanKruithof.fetch(now);
// importers.natuurbrandrisico.fetch(now);
// importers.kampeermeneer.fetch(now);
// importers.communityWalk.fetch(now);
// importers.stichtingWildkamperen.fetch(now);
// importers.bivakzone.fetch(now);
//
// setTimeout(() => createAndLinkLocations.update(now), 2000);
// setTimeout(() => updateLocations.update(now), 4000);
