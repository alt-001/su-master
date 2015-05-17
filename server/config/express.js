var bodyParser, cookieParser, express, logger, methodOverride, session;

express = require('express');

logger = require('morgan');

bodyParser = require('body-parser');

cookieParser = require('cookie-parser');

session = require('express-session');

methodOverride = require('method-override');

module.exports = function(app, config) {
  app.set('views', config.rootPath + '/public');
  app.set('view engine', 'ejs');
  app.engine('html', require('ejs').renderFile);
  app.use(logger('dev'));
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(methodOverride());
  app.use(session({
    secret: 'mean',
    saveUninitialized: true,
    resave: true
  }));
  app.use(express["static"](config.rootPath + '/public'));
};
