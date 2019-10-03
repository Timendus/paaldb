const expect = require('chai').expect;
const roundCoordinate = require('../../util/round-coordinate');

describe('Round coordinate', () => {

  it('should round a coordinate to eight decimals by default', () => {
    expect(roundCoordinate(50.294867536797)).to.equal('50.29486754');
    expect(roundCoordinate(50.29486)).to.equal('50.29486000');
  });

  it('should return a string, not a float because of trailing zeros', () => {
    expect(roundCoordinate(50.142)).to.be.a('string');
    expect(roundCoordinate(50.142)).to.equal('50.14200000');
    expect(roundCoordinate(50.142)).to.not.equal(50.142);
  });

  it('should be able to round to a different number of decimals', () => {
    expect(roundCoordinate(50.294867536797,  4)).to.equal('50.2949');
    expect(roundCoordinate(50.294867536797,  0)).to.equal('50');
    expect(roundCoordinate(50.294867536797,  1)).to.equal('50.3');
    expect(roundCoordinate(50.294867536797, 10)).to.equal('50.2948675368');
  });

});
