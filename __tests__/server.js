const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const appRouter = express.Router();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Request-Headers', '*');
  next();
});
appRouter.use('/', express.static('__tests__/static'));
app.use(appRouter);
appRouter.use(bodyParser.urlencoded({ extended: true }));

appRouter.get('/testHeaders', async (req, res) => res.json(req.headers));
appRouter.post('/postExample', async (req, res) => res.json(req.body));

export default app;
