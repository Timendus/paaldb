module.exports = {

  camelcase: (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  },

  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  stripName: (name) => {
    return name.replace(new RegExp(`(${[
      "Paal\\s",
      "Paalkampeerplaats\\s",
      "Paalcamping\\s",
      "Aanlegplaats\\s",
      "Aanlegplaatsen\\s",
      "Aanlegsteiger\\s",
      "Gastblog:\\s",
      "Bivakzone\\s",
      "Bivouac de\\s",
      "Bivouac d\\'",
      "Bivouac des\\s",
      "Bivouac du\\s"
    ].join('|')})`, 'gi'), '');
  }

}
