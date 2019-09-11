const port       = process.argv[2];
const http       = require('http');
const Logger     = require('./util/logger');
const taskRunner = require('./util/task-runner');
const tasks      = require('./tasks');

// Run server

Logger.log(`Attempting to start server at port ${port}`);

const server = http.createServer((request, response) => {
  Logger.log('Received request for ' + request.url);
});

server.listen(port, () => Logger.log(`Server is listening on port ${port}`));


// Run all tasks at 3 in the morning

taskRunner.schedule("running a full re-import", "03:00:00", tasks.run);
