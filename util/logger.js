module.exports = {

  log: (message, sender=false) => {
    console.log(`[${new Date()}]${sender ? '['+sender+']' : ''} ${message}`);
  },

  error: (message, sender=false) => {
    console.error(`[${new Date()}]${sender ? '['+sender+']' : ''} ${message}`);
  }

}
