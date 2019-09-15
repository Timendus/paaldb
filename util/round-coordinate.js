module.exports = (coordinate) => {
  return (Math.round(coordinate * 100000000) / 100000000).toFixed(8);
}
