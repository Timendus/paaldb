const port = process.argv[2];
const http = require('http');
const Logger = require('./util/logger');


// Run server

Logger.log(`Attempting to start server at port ${port}`);

const server = http.createServer((request, response) => {
  Logger.log('Received request for ' + request.url);
});

server.listen(port, () => Logger.log(`Server is listening on port ${port}`));


// Run tasks

const tasks = require('./tasks');
