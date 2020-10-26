// Rutas sobre usuarios
const router = require('express').Router();
const User = require('../models/User');
var fs = require('fs');
var path = require('path');
const crypto = require('crypto');

router.post('/register', async (req, res) => {

    var hash = crypto.createHash('sha256');
    var pesos = [req.body.peso_actual];
    var fechas = [Date.now()];

    //Calcular peso ideal y IMC usuario
    var peso_ideal = 45;
    var IMC = 45;
    
    try { //por si existe un user con ese nombre de usuario o email
        const user = new User({
            username: req.body.username,
            password: hash.update(req.body.password).digest('hex'),
            imagen: { data:  fs.readFileSync(path.join(__dirname, '../images/imagenPerfil.jpg')), contentType: 'image/jpg'},
            altura: req.body.altura,
            peso_actual: req.body.peso_actual,
            peso_deseado: req.body.peso_deseado,
            peso_ideal: peso_ideal,
            fecha_nacimiento: req.body.fecha_nacimiento,
            fecha_creacion: Date.now(),
            pesos: pesos,
            fechas: fechas,
            email: req.body.email,
            sexo: req.body.sexo,
            IMC: IMC
        });

        const savedUser = await user.save();
        if (isEmpty(savedUser)) {
            res.status(400).json("Internal DB error");
        }
        //Calcular el plan del usuario
        res.status(200).json(savedUser);
    }
    catch(err) {
        console.log("error: " + err)
        res.status(413).json("El usuario o el email ya estan en uso");
    }
});

router.post('/login', async (req, res) => {

    var hash = crypto.createHash('sha256');
    const query = await (await User.findOne({ username: req.body.username }));
    console.log(query);
    if (query === null) return res.status(411).json('Nombre usuario incorrecto');
    else {
        if (query.password != hash.update(req.body.password).digest('hex')) return res.status(411).json('Password incorrecto');
        else return res.status(200).send(query);
    }
});

router.get('/:id/image', async (req, res) => {
    var id = req.params.id;
    const profileImage = await User.findById({ _id: id });
    console.log(profileImage.imagen.data);
    res.contentType(profileImage.imagen.contentType);
    res.send(profileImage.imagen.data);
});

router.post('/modificar/:id', async (req,res) => {
    id = req.params.id;
    username = req.body.username
    altura = req.body.altura
    peso_deseado = req.body.peso_deseado
    email = req.body.email

    const user = await User.findById({ _id: id });
    if(isEmpty(user)) {
        res.status(402).json("usuario inexistente");
    }
    else {
        if (isEmpty(username)) {
            username = user.username;
        }
        if (isEmpty(peso_actual)) {
            peso_actual = user.peso_actual;
        }
        if (isEmpty(email)) {
            email = user.email;
        }

        //Volver a calcular el IMC
        const userMod = await User.findByIdAndUpdate({ _id: id }, {
            username: username,
            altura: altura,
            email: email,
            peso_deseado: peso_deseado,
            fechas: hist_fechas,
            pesos: hist_pesos
        });
        if (isEmpty(userMod)) res.status(403).json("no se ha podido modificar usuario");
        else {
            //Volver a calcular el plan del usuario
            res.status(200).json(userMod);
        }
    }
});

router.post('/registrarPes/:id', async (req,res) => {

    id = req.params.id;
    peso_actual = req.body.peso_actual

    try {
        const user = await User.findById({ _id: id });
        if(isEmpty(user)) {
            res.status(402).json("usuario inexistente");
        }
        else {
            hist_pesos = user.pesos
            hist_fechas = user.fechas
            var fecha_aux = hist_fechas[hist_fechas.length-1]
            var today = new Date();
            if (fecha_aux.getDate() == today.getDate() && fecha_aux.getMonth() == today.getMonth() && fecha_aux.getFullYear() && today.getFullYear()) {
                console.log("HOLA 1")
                if (hist_pesos[hist_pesos.length-1] == peso_actual) {
                    console.log("HOLA 2")
                    return res.status(403).json("ya existe una fecha con este peso");
                }
                else {
                    console.log("HOLA 3")
                    hist_pesos[hist_pesos.length-1] = peso_actual
                }
            }
            else {
                console.log("HOLA 4")
                hist_pesos.push(peso_actual)     
                hist_fechas.push(Date.now())
            }
            //Volver a calcular el IMC
            const userMod = await User.findByIdAndUpdate({ _id: id }, {
                peso_actual: peso_actual,
                fechas: hist_fechas,
                pesos: hist_pesos          
            });
            
            if (isEmpty(userMod)) res.status(403).json("no se ha podido modificar usuario");
            else {
                userMod.peso_actual = peso_actual
                userMod.fechas = hist_fechas
                userMod.pesos = hist_pesos
                 res.status(200).json(userMod);
            }
        }
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json("Usuario innexistente");
    }
});

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = router;