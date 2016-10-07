'use strict';

const app = require('express')();
const middleware = require('./middleware');

const port = process.env.PORT || 10010;

middleware.init(app, port);

app.listen(port);
