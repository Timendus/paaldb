const express    = require('express');
const config     = require('./util/config')['server'];
const Logger     = require('./util/logger');
const taskRunner = require('./util/task-runner');
const tasks      = require('./tasks');
const api        = require('./api');
const exporters  = require('./export');


// Run server

Logger.log(`Starting server at port ${config.port}`);

const app = express();

app.use('/', (req, res, next) => {
  Logger.log(`Received request for ${req.url}`, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
  next();
});

app.use(express.static('public'));
app.use(express.json());
app.use('/api', api);
app.use('/export', exporters);

app.listen(config.port, () =>
  Logger.log(`Server is listening on port ${config.port}`));


// Run all tasks at 3 in the morning

taskRunner.schedule("running a full re-import", "03:00:00", tasks.run);
