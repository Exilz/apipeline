import express from 'express';

const app = express();
const appRouter = express.Router();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
appRouter.use('/', express.static('__tests__/static'));
app.use(appRouter);

export default app;
