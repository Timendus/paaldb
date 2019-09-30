module.exports = (coordinate, positions = 8) => {
  return (
    Math.round(coordinate * Math.pow(10, positions)) /
      Math.pow(10, positions)
  ).toFixed(positions);
}
