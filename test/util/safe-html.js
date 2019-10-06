const expect = require('chai').expect;
const safeHTML = require('../../util/safe-html');

describe('safeHTML', () => {

  describe('trim', () => {
    it('should remove any whitespaces or newlines from the beginning and end of the string', () => {
      expect(safeHTML.trim('<br>Hello world<br/>')).to.equal('Hello world');
      expect(safeHTML.trim('<br>Hello world  <br/>  ')).to.equal('Hello world');
      expect(safeHTML.trim('  <br>Hello world<br/>')).to.equal('Hello world');
      expect(safeHTML.trim('\n<br>  Hello world<br/>')).to.equal('Hello world');
      expect(safeHTML.trim('\n<br>\nHello world\n<br/>\n')).to.equal('Hello world');
    });

    it('should not remove whitespaces or newlines elsewhere in the string', () => {
      expect(safeHTML.trim('Hello <br/> world')).to.equal('Hello <br/> world');
      expect(safeHTML.trim('Hello \n world')).to.equal('Hello \n world');
      expect(safeHTML.trim('Hello <br />&nbsp; world')).to.equal('Hello <br />&nbsp; world');
    });

    it('doesn\'t crash if we feed it null', () => {
      expect(safeHTML.trim(null)).to.equal(null);
    });
  });

});
