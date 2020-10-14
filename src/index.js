// para ejecutar server el comando 'npm run dev'

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv/config');

// Inicializaciones
const app = express();



// Settings
app.set('port', process.env.PORT || 3000);

/*
indico a la app donde esta la carpeta que quiero indicar. Dirname retorna el path de donde se ejecuta en este caso notes-app/src. conjoin concateno directorios
app.set('carpeta que quiero indicar', path.join(__dirname, 'carpeta que quiero indicar'));
*/

// Funciones
//app.use(express.urlencoded({ extended: false })); //el false es para no recibir imagenes
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false })); para leer el body no tengo mucha idea

app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
})); // poder almacenar los datos del usuario que ha iniciado sesion temporalmente

// Variables globales

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/users'));

mongoose.connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true }, () => 
	console.log('connected to DB'));


// Server run
app.listen(app.get('port'), () => {
    console.log('Server escuchando', app.get('port'));
});