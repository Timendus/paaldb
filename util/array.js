module.exports = {

  flatten: (a) => [].concat.apply([], a),
  unique:  (a) => [...new Set(a)],
  last:    (a) => a && a.length > 0 ? a[a.length - 1] : null

}
