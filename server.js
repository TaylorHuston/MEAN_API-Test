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

apiRouter.route('/users')
  //Create user using POST at localhost:8080/api/users
  .post(function (req, res) {
    var user = new User();
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.password;

    user.save(function (err) {
      if (err) {
        //Duplicate entry
        if (err.code == 11000) {
          return res.json({
            success: false,
            message: "A user with that username already exists."
          });
        } else {
          return res.send(err);
        }
      }

      res.json({
        message: "User created."
      });

    });
  })

//Get all users
.get(function (req, res) {
  User.find(function (err, users) {
    if (err) {
      res.send(err);
    }

    res.json(users);
  });
});

//Get single user
apiRouter.route('/users/:user_id')
  .get(function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
      if (err) {
        res.send(err)
      }

      res.json(user);
    });
  })

//Update user
.put(function (req, res) {
  User.findById(req.params.user_ud, function (err, user) {
    if (err) {
      res.send(err);
    }

    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.body.username) {
      user.username = req.body.username;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    user.save(function (err) {
      if (err) {
        res.send(err);
      }

      res.json({
        message: "User updated"
      });
    });

  });

})

//Delete user
.delete(function (req, res) {
  User.remove({_id: req.params.user_id}, function (err, user) {
      if (err) {
        return res.send(err);
      }

      res.json({
        message: 'Successfully deleted'
      });
    });
})

//Register routes
app.use('/api', apiRouter);

//Start server
app.listen(port);
console.log("Live at localhost " + port);

mongoose.connect("mongodb://taylor:testpass@ds017688.mlab.com:17688/api-test");