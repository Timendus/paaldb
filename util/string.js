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
      "Paal\\s+",
      "Paalkampeerplaats\\s+",
      "Paalcamping\\s+",
      "Aanlegplaats\\s+",
      "Aanlegplaatsen\\s+",
      "Aanlegsteiger\\s+",
      "Gastblog:\\s+",
      "Bivakzone:\\s+",
      "Bivakzone\\s+",
      "Bivouac des\\s+",
      "Bivouac de\\s+",
      "Bivouac du\\s+",
      "Bivouac d\\'",
      "Bivouac\\s+",
      "Aire de Bivouac de la\\s+",
      "Aire de Bivouac des\\s+",
      "Aire de Bivouac de\\s+",
      "Aire de Bivouac du\\s+",
      "Aire de Bivouac d\\'",
      "Aire de Bivouac\\s+"
    ].join('|')})`, 'gi'), '');
  }

}
