const expect = require('chai').expect;
const string = require('../../util/string');

describe('String helpers', () => {

  describe('#camelcase()', () => {
    it('should lowercase the first letter', () => {
      expect(string.camelcase('Hello')).to.equal('hello');
    });

    it('should capitalize words after the first one and join them', () => {
      expect(string.camelcase('Hello World')).to.equal('helloWorld');
      expect(string.camelcase('Hello world')).to.equal('helloWorld');
    });
  });

  describe('#capitalize()', () => {
    it('should change the first letter to a capital', () => {
      expect(string.capitalize('hello')).to.equal('Hello');
      expect(string.capitalize('Hello')).to.equal('Hello');
      expect(string.capitalize('HELLO')).to.equal('HELLO');
    });
  });

  describe('#stripName()', () => {
    it("should remove much used prefixes and information that doesn't add anything", () => {
      expect(string.stripName('Paalkampeerplaats de Visstick')).to.equal('de Visstick');
      expect(string.stripName('Bivakzone: Het Frikandelletje')).to.equal('Het Frikandelletje');
      expect(string.stripName('Gastblog: Paal Patat Met')).to.equal('Patat Met');
    });
  });

});
