const { stefanKruithof,
        staatsbosbeheer,
        natuurbrandrisico,
        createAndLinkLocations,
        updateLocations } = require('./tasks');


now = Date.now();

// stefanKruithof.fetch(now);
// staatsbosbeheer.fetch(now);
// natuurbrandrisico.fetch(now);

setTimeout(() => createAndLinkLocations.update(now), 2000);
setTimeout(() => updateLocations.update(now), 4000);
