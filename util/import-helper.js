const {Source, Mention} = require('../models');
const Logger            = require('./logger');

module.exports = {

  save: (task, source, mentions) => {

    // If no data, assume task or remote source is broken and don't touch the database
    if ( !source.name || !source.description || !source.contact || mentions.length == 0 )
      return Logger.error(`Task ${task} seems to be down`);

    // Find or create our source in the database
    Source.findOrCreate({
      where: { name: source.name }
    })

    .then(([sourceObj]) => {

      // Update our source information
      sourceObj.description = source.description;
      sourceObj.contact     = source.contact;
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
              name: mention.name,
              SourceId: sourceObj.id
            }
          }).then(([mentionObj]) => {

            // Update our mention information
            mentionObj.status      = mention.status || Mention.status.ACTIVE;
            mentionObj.description = mention.description;
            mentionObj.latitude    = mention.latitude;
            mentionObj.longitude   = mention.longitude;
            mentionObj.height      = mention.height;
            mentionObj.save();

            // Register that this mention is (still) in the source
            newMentions.push(mentionObj);
          });
        });

        // Wait for all saves, then present conclusions
        Promise.all(promises).then(() => {
          const created = newMentions.filter(n => !oldMentions.map(m => m.id).includes(n.id));
          const stale   = oldMentions.filter(n => !newMentions.map(m => m.id).includes(n.id))
                                     .filter(m => !m.stale == Mention.status.STALE);

          stale.forEach((m) => {
            m.status = Mention.status.STALE;
            m.save();
          });

          Logger.log(`Task ${task}: Newly created mentions (${created.length}): [${created.map(c => c.name).join(',')}]`);
          Logger.log(`Task ${task}: Mentions marked as stale (${stale.length}): [${stale.map(c => c.name).join(',')}]`);
        });
      });
    });

  }

}
