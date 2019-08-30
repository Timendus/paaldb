const Logger = require('./logger');
const tasks  = [];

setInterval(() => {
  const now = new Date();
  tasks.forEach((t) => {
    if ( t[1] == now.toLocaleTimeString('nl-NL') ) {
      Logger.log(`Running scheduled task for '${t[0]}'`);
      t[2](now);
    }
  });
}, 1000);

module.exports = {
  schedule: (description, time, task) => {
    tasks.push([description, time, task]);
    Logger.log(`Scheduled a task for '${description}' at ${time}`);
  }
}
