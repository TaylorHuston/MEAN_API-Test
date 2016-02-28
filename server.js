//***SETUP***
var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  port = process.env.PORT || 8080,
  User = require('./app/models/user');

//Use body parser to grab information from POST requests
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//CORS requests
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
  next();
});

//Log all requests to console
app.use(morgan('dev'));


//***ROUTES***

//Root route
app.get('/', function (req, res) {
  res.send('Home page');
});

//Get an Express Router
var apiRouter = express.Router();

//Happens before each request
apiRouter.use(function (req, res, next) {
  console.log('A thing just happened');
  next();
});

apiRouter.get('/', function (req, res) {
  res.json({
    message: 'Welcome'
  });
});

//Register routes
app.use('/api', apiRouter);

//Start server
app.listen(port);
console.log("Live at localhost " + port);

mongoose.connect("mongodb://taylor:testpass@ds017688.mlab.com:17688/api-test")