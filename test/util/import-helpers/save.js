const {
  Source,
  Mention,
  Property,
  MentionProperty
} = require('../../../models');

const expect       = require('chai').expect;
const importHelper = require('../../../util/import-helpers/save');

describe('Import helper', () => {

  describe('#createExternalId()', () => {
    it('should create a semi-unique id for a mention, based on name and rough location', () => {
      expect(importHelper.createExternalId({
        name: 'Fast Walking Dinosaurs'
      }, {
        latitude: 50.2483656,
        longitude: 6.2343486
      })).to.equal('Fast Walking Dinosaurs-50.248-6.234')
    });
  });

  describe('#save()', () => {

    const someSource = {
      name:        "I'm a source",
      description: "A source of much sweet sorrow",
      contact:     "Please don't"
    }

    const minimalMention = {
      name:      "I'm a mention",
      latitude:  50.123456,
      longitude: 6.123456
    }

    const completeMention = {
      externalId:  12345,
      name:        "I'm another mention",
      status:      Mention.status.STALE,
      description: "I'm some place that some source thinks is a thing",
      latitude:    50.123456,
      longitude:   6.123456,
      height:      150,
      link:        "https://github.com/Timendus/paaldb",
      date:        Date.parse('2019-10-02 22:10:00'),

      properties: {
        isAwesome: true
      }
    }

    beforeEach(async () => {
      await MentionProperty.destroy({ where: {} });
      await Property.destroy({ where: {} });
      await Mention.destroy({ where: {} });
      await Source.destroy({ where: {} });
    });

    it('should create all the right records in the database (once)', async () => {
      expect(await Source.count()).to.equal(0);
      expect(await Mention.count()).to.equal(0);
      expect(await MentionProperty.count()).to.equal(0);
      expect(await Property.count()).to.equal(0);

      await importHelper.save({
        task: 'import-helper-test',
        source: someSource,
        mentions: [minimalMention, completeMention]
      });

      // Source and mentions should have been added
      expect(await Source.count()).to.equal(1);
      expect(await Mention.count()).to.equal(2);
      expect(await MentionProperty.count()).to.equal(1);
      expect(await Property.count()).to.equal(1);

      await importHelper.save({
        task: 'import-helper-test',
        source: someSource,
        mentions: [minimalMention, completeMention]
      });

      // Source and mentions should have been found and updated
      expect(await Source.count()).to.equal(1);
      expect(await Mention.count()).to.equal(2);
      expect(await MentionProperty.count()).to.equal(1);
      expect(await Property.count()).to.equal(1);
    });

    it('should update fields that have changed since last run', async () => {
      await importHelper.save({
        task: 'import-helper-test',
        source: someSource,
        mentions: [minimalMention, completeMention]
      });

      let mention = await Mention.findOne({
        where: { externalId: 12345 }
      });

      expect(mention.description).to.equal("I'm some place that some source thinks is a thing");
      completeMention.description = "Now I'm a changed man";

      await importHelper.save({
        task: 'import-helper-test',
        source: someSource,
        mentions: [minimalMention, completeMention]
      });

      mention = await Mention.findOne({
        where: { externalId: 12345 }
      });

      expect(mention.description).to.equal("Now I'm a changed man");
    });

    it('should abort if we give it no data', async () => {
      expect(await Source.count()).to.equal(0);
      expect(await Mention.count()).to.equal(0);
      expect(await MentionProperty.count()).to.equal(0);
      expect(await Property.count()).to.equal(0);

      await importHelper.save({
        task: 'import-helper-test',
        source: {},
        mentions: [minimalMention, completeMention]
      });

      expect(await Source.count()).to.equal(0);
      expect(await Mention.count()).to.equal(0);
      expect(await MentionProperty.count()).to.equal(0);
      expect(await Property.count()).to.equal(0);

      await importHelper.save({
        task: 'import-helper-test',
        source: someSource,
        mentions: []
      });

      expect(await Source.count()).to.equal(0);
      expect(await Mention.count()).to.equal(0);
      expect(await MentionProperty.count()).to.equal(0);
      expect(await Property.count()).to.equal(0);
    });

    it('should skip empty mentions', async () => {
      expect(await Source.count()).to.equal(0);
      expect(await Mention.count()).to.equal(0);
      expect(await MentionProperty.count()).to.equal(0);
      expect(await Property.count()).to.equal(0);

      await importHelper.save({
        task: 'import-helper-test',
        source: someSource,
        mentions: [minimalMention, {}, completeMention, {}]
      });

      expect(await Source.count()).to.equal(1);
      expect(await Mention.count()).to.equal(2);
      expect(await MentionProperty.count()).to.equal(1);
      expect(await Property.count()).to.equal(1);
    });

  });

});
