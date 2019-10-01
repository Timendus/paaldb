const expect = require('chai').expect;
const importHelper = require('../../util/import-helper');

describe('Import helper', () => {

  describe('#createExternalId()', () => {
    it('should create a semi-unique id for a mention, based on name and rough location', () => {
      expect(importHelper.createExternalId({
        name: 'Paal de Grote Kaassouffle',
        latitude: 50.2483656,
        longitude: 6.2343486
      })).to.equal('Paal de Grote Kaassouffle-50.25-6.23')
    });
  });

  describe('#save()', () => {
    xit('should save the given source and mentions to the database', () => {
      // TODO because we need a test database first
    });
  });

});
