const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const routes = require('./routes');
const connectToMongoDB = require('./mongoose');

async function startServer() {
  await connectToMongoDB();

  const app = express();
  const port = process.env.PORT || 4000;

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
  app.use(bodyParser.json());

  app.use('/', routes);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  module.exports = app;
}

startServer();

