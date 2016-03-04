//***SETUP***
var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  port = process.env.PORT || 8080,
  User = require('./app/models/user'),
  jwt = require('jsonwebtoken'),
  superSecret = 'ilovescotchscotchyscotchscotch';

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

//Basic routes for homepage
app.get('/', function (req, res) {
  res.send('Home page');
});

//Get an Express Router
var apiRouter = express.Router();

//Authenticaiton routes
apiRouter.post('/authenticate', function (req, res) {
  //Find user
  User.findOne({
      username: req.body.username
    })
    .select('name username password')
    .exec(function (err, user) {
      if (err) {
        throw err;
      }

      if (!user) {
        res.json({
          success: false,
          message: "User not found."
        })
      } else if (user) {

        //Check password
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.json({
            success: false,
            message: "Wrong password."
          })
        } else {
          //Create token
          var token = jwt.sign({
            name: user.name,
            username: user.username
          }, superSecret, {
            expiresInMinutes: 1440 //24 hours
          });

          res.json({
            success: true,
            message: "Token created.",
            token: token
          });
        }

      }


    });

});

//Happens before each request
apiRouter.use(function (req, res, next) {
  console.log('A thing just happened');

  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, superSecret, function (err, decoded) {
      if (err) {
        return res.status(403).send({
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        req.decoded = decoded;

        next();
      }
    });

  } else {
    //No token
    return res.status(403).send({
      success: false,
      mesage: 'No token provided.'
    });
  }
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
  User.remove({
    _id: req.params.user_id
  }, function (err, user) {
    if (err) {
      return res.send(err);
    }

    res.json({
      message: 'Successfully deleted'
    });
  });
})

apiRouter.get('/me', function(req, res) {
  res.send(req.decoded);
})

//Register routes
app.use('/api', apiRouter);

//Start server
app.listen(port);
console.log("Live at localhost " + port);

mongoose.connect("mongodb://taylor:testpass@ds017688.mlab.com:17688/api-test");