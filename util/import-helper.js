const {Source, Mention} = require('../models');
const safeHTML          = require("./safe-html");
const Logger            = require('./logger');
const roundCoordinate   = require('./round-coordinate');
const path              = require('path');
const proj4             = require('proj4');

proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

module.exports = {

  save: ({task, source, mentions, projection}) => {
    return new Promise((resolve, reject) => {

      // We don't need the whole path
      task = path.basename(task);
      projection = projection || 'WGS84';

      // If no data, assume task or remote source is broken and don't touch the database
      if ( !source.name || !source.description || !source.contact || mentions.length == 0 )
        return Logger.error(`Task ${task} seems to be down`);

      // Find or create our source in the database
      Source.findOrCreate({
        where: { name: safeHTML.parse(source.name) }
      })

      .then(([sourceObj]) => {

        // Update our source information
        sourceObj.description = safeHTML.parse(source.description);
        sourceObj.contact     = safeHTML.parse(source.contact);
        sourceObj.save();

        // Bookkeeping
        const newMentions = [];
        let numChanged = 0;

        sourceObj.getMentions().then((oldMentions) => {

          // Collect all promises so we can wait for them later
          const promises = mentions.map((mention) => {

            // If no data, assume mention is invalid
            if ( !mention.name || !mention.latitude || !mention.longitude )
              return;

            // Find or create our mention in the database
            return Mention.findOrCreate({
              where: {
                name: safeHTML.parse(mention.name),
                SourceId: sourceObj.id
              }
            }).then(([mentionObj]) => {

              // Register that this mention is (still) in the source
              newMentions.push(mentionObj);

              // Project the coordinates to the right coordinate system
              const coordinates = proj4(projection, 'WGS84', {
                x: 1 * mention.longitude,
                y: 1 * mention.latitude,
                z: 1 * mention.height
              });

              // Update our mention information
              mentionObj.status      = mention.status || Mention.status.ACTIVE;
              mentionObj.description = safeHTML.parse(mention.description);
              mentionObj.longitude   = roundCoordinate(coordinates.x);
              mentionObj.latitude    = roundCoordinate(coordinates.y);
              mentionObj.height      = coordinates.z || 0;

              if ( mentionObj.changed() ) numChanged++;
              return mentionObj.save();
            });
          });

          // Wait for all saves, then present conclusions
          Promise.all(promises).then(() => {
            const created = newMentions.filter(n => !oldMentions.map(m => m.id).includes(n.id));
            const stale   = oldMentions.filter(n => !newMentions.map(m => m.id).includes(n.id))
                                       .filter(m => !m.stale == Mention.status.STALE);

            Promise.all(stale.map((m) => {
              m.status = Mention.status.STALE;
              return m.save();
            })).then(() => {
              Logger.log(`Task ${task}: Newly created mentions (${created.length}): [${created.map(c => c.name).join(',')}]`);
              Logger.log(`Task ${task}: Mentions marked as stale (${stale.length}): [${stale.map(c => c.name).join(',')}]`);
              Logger.log(`Task ${task}: Otherwise, updated ${numChanged} mentions`);
              resolve();
            });
          });

        });

      });

    });
  }

}
