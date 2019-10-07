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

    it('should not crash on null or empty array', () => {
      expect(array.flatten(null)).to.deep.equal([]);
      expect(array.flatten([])).to.deep.equal([]);
    });

  });

  describe('#unique', () => {

    it('should remove any duplicates from the array', () => {
      expect(array.unique([1,2,3,1,2,3,7,2])).to.deep.equal([1,2,3,7]);
    });

    it('should not crash on null or empty array', () => {
      expect(array.unique(null)).to.deep.equal([]);
      expect(array.unique([])).to.deep.equal([]);
    });

  });

  describe('#last', () => {

    it('should return the last item of the array', () => {
      expect(array.last([1,2,3,4])).to.equal(4);
    });

    it('should not modify the array', () => {
      let a = [3,7,9,2];
      expect(array.last(a)).to.equal(2);
      expect(a).to.deep.equal([3,7,9,2]);
    });

    it('should not crash on null or empty array', () => {
      expect(array.last(null)).to.equal(null);
      expect(array.last([])).to.equal(null);
    });

  });

});
