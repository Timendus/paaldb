const express        = require('express');
const config         = require('./util/config')['server'];
const Logger         = require('./util/logger');
const taskRunner     = require('./util/task-runner');
const tasks          = require('./tasks');
const api            = require('./api');
const exporters      = require('./export');
const mentionService = require('./services/mention');


// Run server

Logger.log(`Starting server at port ${config.port}`);

const app = express();

app.use('/', (req, res, next) => {
  Logger.log(`Received request for ${req.url}`, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
  next();
});

app.use('/api', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('public'));
app.use(express.json());
app.get('/status', status);
app.use('/api', api);
app.use('/export', exporters);

app.listen(config.port, () =>
  Logger.log(`Server is listening on port ${config.port}`));


// Run all tasks at 3 in the morning

taskRunner.schedule("Running all tasks", "03:00:00", tasks.run);


// Status function

async function status(req, res) {
  res.set("Content-Type", "text/plain");

  try {
    const mention  = (await mentionService.findNewest()).shift();
    if ( !mention ) throw('No last mention found');
    const lastTime = mention.updatedAt;

    if ( lastTime.valueOf() < (new Date).valueOf() - 24*60*60*1000 ) {
      res.send(`Last mention updated at ${lastTime.toLocaleString('nl-NL')}\n\n[WARN] The last mention is pretty old. Looks like maybe the tasks aren't running...`);
    } else {
      res.send(`Last mention updated at ${lastTime.toLocaleString('nl-NL')}\n\n[OK] All is well!`);
    }
  } catch(err) {
    res.status(500).send(`[ERR] We're in trouble: ${err}`);
  }
}
