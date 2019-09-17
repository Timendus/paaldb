const Logger     = require('../util/logger');
const tasks      = require('../tasks');

(async function() {

  Logger.log("Import: Running all tasks right now");

  await tasks.run();

  Logger.log("All import tasks done. You can now safely exit this process (Ctrl+C)");

})();
