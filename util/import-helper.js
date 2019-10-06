const {Source, Mention, Property} = require('../models');

const safeHTML        = require("./safe-html");
const Logger          = require('./logger');
const roundCoordinate = require('./round-coordinate');
const path            = require('path');
const proj4           = require('proj4');

proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

module.exports.save = async ({task, source, mentions, projection}) => {
  // Sanitize the input a bit
  task = path.basename(task);
  projection = projection || 'WGS84';

  // If no data, assume task or remote source is broken and don't touch the database
  if ( !source.name || !source.description || !source.contact || mentions.length == 0 )
    return Logger.error(`Task ${task} seems to be down`);

  // Create || find and update our source
  const sourceObj = await saveSource(source);

  // Which mentions does our source have, before we save the new ones?
  const oldMentions = await sourceObj.getMentions();

  // Create || find and update our mentions (and link to this source)
  const {numChanged, newMentions} = await saveMentions(sourceObj, mentions, projection);

  // Mark those mentions that have disappeared from the source as stale
  const staleMentions = await markStaleMentions(oldMentions, newMentions);

  // Which of the mentions we've seen this time are really newly created?
  const oldMentionIds = oldMentions.map(m => m.id);
  const createdMentions = newMentions.filter(n => !oldMentionIds.includes(n.id));

  Logger.log(`Task ${task}: Newly created mentions (${createdMentions.length}): [${createdMentions.map(c => c.name).join(',')}]`);
  Logger.log(`Task ${task}: Mentions marked as stale (${staleMentions.length}): [${staleMentions.map(c => c.name).join(',')}]`);
  Logger.log(`Task ${task}: Otherwise, updated ${numChanged} mentions`);
}

async function saveSource(source) {
  const sourceObj = (await Source.findOrCreate({
    where: {
      name: safeHTML.parse(source.name)
    }
  })).shift();

  sourceObj.description = safeHTML.parse(source.description);
  sourceObj.contact     = safeHTML.parse(source.contact);
  await sourceObj.save();

  return sourceObj;
}

async function saveMentions(sourceObj, mentions, projection) {
  let numChanged = 0;
  const newMentions = [];

  for ( const mention of mentions ) {
    // If no data, assume mention is invalid
    if ( !mention.name || !mention.latitude || !mention.longitude )
      continue;

    const mentionObj = (await Mention.findOrCreate({
      where: {
        externalId: mention.externalId ? '' + mention.externalId : createExternalId(sourceObj, mention),
        SourceId:   sourceObj.id
      }
    })).shift();

    // Register that this mention is (still) in the source
    newMentions.push(mentionObj);

    // Project the coordinates to the right coordinate system
    const coordinates = proj4(projection, 'WGS84', {
      x: 1 * mention.longitude,
      y: 1 * mention.latitude,
      z: 1 * mention.height
    });

    // Update our mention information
    mentionObj.name        = safeHTML.parse(mention.name);
    mentionObj.status      = mention.status || Mention.status.ACTIVE;
    mentionObj.description = safeHTML.trim(safeHTML.parse(mention.description));
    mentionObj.longitude   = roundCoordinate(coordinates.x);
    mentionObj.latitude    = roundCoordinate(coordinates.y);
    mentionObj.height      = coordinates.z || 0;
    mentionObj.link        = safeHTML.parse(mention.link);

    if ( mention.date )
      mentionObj.date = mention.date;

    if ( mentionObj.changed() ) numChanged++;
    await mentionObj.save();
    await saveProperties(mentionObj, mention.properties);
  }

  return {numChanged, newMentions};
}

function createExternalId(sourceObj, mention) {
  return `${sourceObj.name}-${roundCoordinate(mention.latitude, 3)}-${roundCoordinate(mention.longitude, 3)}`;
}

// Export for testing
module.exports.createExternalId = createExternalId;

async function saveProperties(mentionObj, properties) {
  for ( const property in properties ) {
    let value = properties[property];
    if ( value === true  ) value = 'yes';
    if ( value === false ) value = 'no';

    const propertyObj = (await Property.findOrCreate({
      where: {
        label: property,
        value: value
      }
    })).shift();

    await mentionObj.addProperty(propertyObj)
  }
}

async function markStaleMentions(oldMentions, newMentions) {
  const newMentionIds = newMentions.map(m => m.id);
  const staleMentions = oldMentions.filter(m => !newMentionIds.includes(m.id))
                                   .filter(m => m.status != Mention.status.STALE);

  for ( const staleMention of staleMentions ) {
    staleMention.status = Mention.status.STALE;
    await staleMention.save();
  }

  return staleMentions;
}
