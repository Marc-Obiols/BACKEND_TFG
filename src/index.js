var express = require('express');
var path = require('path');
var logger = require('morgan');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const MongoClient = require('mongoose');
require('dotenv/config');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json({ limit: "50mb", extended: true, parameterLimit: 50000 }));

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
var user = require('./routes/users');
var plan = require('./routes/plan');
var ejercicio = require('./routes/ejercicio');
var rutina = require('./routes/rutina');
var alimentacion = require('./routes/alimentacion');
var validate = require('./routes/validate');
var dieta = require('./routes/dietas');
app.use('/', routes);
app.use('/users', user);
app.use('/plan', plan);
app.use('/ejercicio', ejercicio);
app.use('/rutina', rutina);
app.use('/alimentacion', alimentacion)
app.use('/validate', validate)
app.use('/dietas', dieta)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).json("Unknown route");
});

//Port listener
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
 //DB Connection
MongoClient.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true
}, () => console.log('Connected to MongoDB'));