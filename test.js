const { stefanKruithof,
        staatsbosbeheer,
        natuurbrandrisico,
        createAndLinkLocations,
        updateLocations,
        kampeermeneer,
        communityWalk,
        stichtingWildkamperen } = require('./tasks');

now = Date.now();

// stefanKruithof.fetch(now);
// staatsbosbeheer.fetch(now);
// natuurbrandrisico.fetch(now);
// kampeermeneer.fetch(now);
// communityWalk.fetch(now);
// stichtingWildkamperen.fetch(now);

setTimeout(() => createAndLinkLocations.update(now), 2000);
setTimeout(() => updateLocations.update(now), 4000);
