const expect = require('chai').expect;
const array  = require('../../util/array');

describe('Array helpers', () => {

  describe('#flatten', () => {

    it('should flatten arrays', () => {
      expect(array.flatten([ [1,2], [3,4] ])).to.deep.equal([1,2,3,4]);
    });

    it('should flatten arrays only one level deep', () => {
      expect(array.flatten([ [1,[5,6]], [3,4] ])).to.deep.equal([1,[5,6],3,4]);
    });

  });

  describe('#unique', () => {

    it('should remove any duplicates from the array', () => {
      expect(array.unique([1,2,3,1,2,3,7,2])).to.deep.equal([1,2,3,7]);
    });

  });

});
