const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Person = require('./models.js');

const port = process.env.PORT || 3000;

const server = express();

// error status code constants
const STATUS_SERVER_ERROR = 500;
const STATUS_USER_ERROR = 422;

server.use(bodyParser.json());

// Your API will be built out here.

server.get('/users', (req, res) => {
    Person.find().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.status(STATUS_SERVER_ERROR).json(err);
    });

});

server.get('/users/:direction', (req, res) => {
    // if (!req.body.direction) res.status(STATUS_USER_ERROR).json({error: 'Request did not specify sort \'direction\''});
    if (['asc', 'desc'].indexOf(req.params.direction) === -1) {
        res.status(STATUS_USER_ERROR).json({ error: 'direction type unsupported' });
    }

    Person.find()
    .sort({firstName: req.params.direction === 'asc' ? 1 : -1 })
    .then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    });
});

server.get('/user-get-friends/:id', (req, res) => {
    Person.findOne({ '_id': req.params.id }).select('friends').then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    });
});

server.put('/users', (req, res) => {
    if (!req.body.user || !req.body.query) {
        return res.status(STATUS_USER_ERROR).json({ error: 'Did not supply single user object or array of user objects' });
    }

    const findArr = Object.keys(req.body.query).map((key, i) => {
        return {key: req.body.query[key]};
    });

    if (findArr.length === 0) {
        return res.status(STATUS_USER_ERROR).json({ error: 'Did not provide proper query object' });
    }

    Person.findOneAndUpdate(req.body.query, req.body.user).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.status(STATUS_SERVER_ERROR).json({ error: err });
    });
});

mongoose.Promise = global.Promise;
const connect = mongoose.connect('mongodb://localhost/people', {
  useMongoClient: true
});
/* eslint no-console: 0 */
connect.then(
  () => {
    server.listen(port);
    console.log(`Server Listening on ${port}`);
  },
  err => {
    console.log('\n************************');
    console.log("ERROR: Couldn't connect to MongoDB. Do you have it running?");
    console.log('************************\n');
  }
);
