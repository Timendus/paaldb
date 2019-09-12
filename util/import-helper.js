const {Source, Mention} = require('../models');
const safeHTML          = require("./safe-html");
const Logger            = require('./logger');
const path              = require('path');

module.exports = {

  save: ({task, source, mentions}) => {
    return new Promise((resolve, reject) => {

      // We don't need the whole path
      task = path.basename(task);

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

        // Keep track of old and new mentions, wait for result
        const newMentions = [];
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

              // Update our mention information
              mentionObj.status      = mention.status || Mention.status.ACTIVE;
              mentionObj.description = safeHTML.parse(mention.description);
              mentionObj.latitude    = safeHTML.parse(mention.latitude);
              mentionObj.longitude   = safeHTML.parse(mention.longitude);
              mentionObj.height      = safeHTML.parse(mention.height);
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
              resolve();
            });
          });

        });

      });

    });
  }

}
