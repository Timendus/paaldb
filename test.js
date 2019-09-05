const { natuurbrandrisico,
        createAndLinkLocations,
        updateLocations,
        importers } = require('./tasks');

now = Date.now();

// importers.stefanKruithof.fetch(now);
// importers.staatsbosbeheer.fetch(now);
// importers.natuurbrandrisico.fetch(now);
// importers.kampeermeneer.fetch(now);
// importers.communityWalk.fetch(now);
// importers.stichtingWildkamperen.fetch(now);

setTimeout(() => createAndLinkLocations.update(now), 2000);
setTimeout(() => updateLocations.update(now), 4000);
