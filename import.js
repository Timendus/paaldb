const Logger     = require('./util/logger');
const tasks      = require('./tasks');

// Run all tasks right now

Logger.log("Import: Running all tasks right now");

tasks.run().then(() =>
  Logger.log("All import tasks done. You can now safely exit this process (Ctrl+C)"));
