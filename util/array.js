module.exports = {

  flatten: (a) => [].concat.apply([], a),
  unique:  (a) => [...new Set(a)]

}
