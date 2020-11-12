// Rutas sobre usuarios
const router = require('express').Router();
const User = require('../models/User');
const Plan = require('../models/Plan');
const Alimentacion = require('../models/Alimentacion');
var fs = require('fs');
var path = require('path');
const crypto = require('crypto');

router.post('/register', async (req, res) => {

    var hash = crypto.createHash('sha256');
    var pesos = [req.body.peso_actual];
    var fechas = [Date.now()];

    //Calcular peso ideal y IMC usuario
    var IMC = (req.body.peso_actual*10000)/(Math.pow(req.body.altura, 2));
    IMC = IMC.toFixed();
    var peso_ideal = PI(req.body.altura, req.body.sexo).toFixed();

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
        ano_nac = savedUser.fecha_nacimiento.getFullYear();
        var today = new Date();
        var edad =  today.getFullYear() - ano_nac;
        tmb_peso_deseado = TMB(savedUser.peso_deseado, req.body.sexo, edad);
        var hidratos = (tmb_peso_deseado * 0.62)/4.1; // el 62% del tmb han de ser hidratos
        var proteinas = (tmb_peso_deseado * 0.125)/4.35; // el % del tmb han de ser proteinas
        var grasas = (tmb_peso_deseado * 0.225)/9.3; // el % del tmb han de ser grasas
        var fibras = tmb_peso_deseado * 0.0115; // 11.5 gramos de fibra por 1000 kcal
        var azucar = (tmb_peso_deseado * 0.03)/4;
        
        const plan = new Plan({
            Usuario: savedUser._id,
            Proteinas: proteinas.toFixed(),
            Sodio: 3,
            Azucar: azucar.toFixed(),
            Carbohidratos: hidratos.toFixed(),
            Grasas: grasas.toFixed(),
            Fibra: fibras.toFixed(),
            Kcal: tmb_peso_deseado
        });
        const savedPlan = await plan.save();
        if (isEmpty(savedPlan)) {
            res.status(400).json("Internal DB error");
        }
        
        const alimentacion = new Alimentacion({
            propietario: savedUser._id,
        });
        const savedAlimentacion = await alimentacion.save();
        if (isEmpty(savedAlimentacion)) {
            res.status(400).json("Internal DB error");
        }

        return res.status(200).json(savedUser);
    }
    catch(err) {
        console.log("error: " + err)
        return res.status(413).json(err);
    }
});

router.post('/login', async (req, res) => {

    var hash = crypto.createHash('sha256');
    const query = await User.findOne({ username: req.body.username });
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
    peso_deseado = req.body.peso_deseado
    email = req.body.email
    console.log("HOLA")

    try {
        const user = await User.findById({ _id: id });
        if(isEmpty(user)) {
            res.status(402).json("usuario inexistente");
        }
        else {
            if (isEmpty(username)) {
                username = user.username;
            }
            if (isEmpty(email)) {
                email = user.email;
            }

            const userMod = await User.findByIdAndUpdate({ _id: id }, {
                username: username,
                email: email,
                peso_deseado: peso_deseado
            });
            if (isEmpty(userMod)) res.status(403).json("no se ha podido modificar usuario");
            else {
                ano_nac = userMod.fecha_nacimiento.getFullYear();
                var today = new Date();
                var edad =  today.getFullYear() - ano_nac;
                tmb_peso_deseado = TMB(peso_deseado, userMod.sexo, edad);
                var hidratos = (tmb_peso_deseado * 0.62)/4.1; // el 62% del tmb han de ser hidratos
                var proteinas = (tmb_peso_deseado * 0.125)/4.35; // el % del tmb han de ser proteinas
                var grasas = (tmb_peso_deseado * 0.225)/9.3; // el % del tmb han de ser grasas
                var fibras = tmb_peso_deseado * 0.0115; // 11.5 gramos de fibra por 1000 kcal
                var azucar = (tmb_peso_deseado * 0.03)/4;

                const planMod = await Plan.findOneAndUpdate({ Usuario: userMod._id }, {
                    Proteinas: proteinas.toFixed(),
                    Sodio: 3,
                    Azucar: azucar.toFixed(),
                    Carbohidratos: hidratos.toFixed(),
                    Grasas: grasas.toFixed(),
                    Fibra: fibras.toFixed(),
                    Kcal: tmb_peso_deseado
                });
                userMod.peso_deseado = peso_deseado
                res.status(200).json(userMod);
            }
        }
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json("Usuario innexistente");
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
            var IMC = (peso_actual*10000)/(Math.pow(user.altura, 2));
            IMC = IMC.toFixed();
            const userMod = await User.findByIdAndUpdate({ _id: id }, {
                peso_actual: peso_actual,
                fechas: hist_fechas,
                pesos: hist_pesos,
                IMC: IMC      
            });
            
            if (isEmpty(userMod)) res.status(403).json("no se ha podido modificar usuario");
            else {
                userMod.peso_actual = peso_actual
                userMod.fechas = hist_fechas
                userMod.pesos = hist_pesos
                userMod.IMC = IMC
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

function TMB(peso, sexo, edad) {
    var result
    var comp = sexo.localeCompare("hombre")
    if (comp == 0) {
        console.log("SOY HOMBRE")
        if (edad < 19) { //1-18
            result = 0.056 * peso + 2.898
        }
        else if(edad < 31 && edad > 18) { //19-30
            result = 0.062 * peso + 2.036
        }
        else if(edad < 61 && edad > 30) { //31-60
            result = 0.034 * peso + 3.538
        }
        else { //61 
            result = 0.038 * peso + 2.755
        }
    }
    else {
        console.log("SOY MUJER")
        if (edad < 19) { //1-18
            result = 0.074 * peso + 2.754
        }
        else if(edad < 31 && edad > 18) { //19-30
            result = 0.063 * peso + 2.896
        }
        else if(edad < 61 && edad > 30) { //31-60
            result = 0.048 * peso + 3.653
        }
        else { //61 
            result = 0.049 * peso + 2.459
        }
    }
    result = result * 239 * 1.7
    return result.toFixed();
}

function PI(alt, sexo) {
    var alt_m = alt/100
    var comp = sexo.localeCompare("hombre")
    if (comp == 0) {
        console.log(Math.pow(alt_m,2) * 26)
        console.log("SOY HOMBRE")
        return Math.pow(alt_m,2) * 24;
    }
    else{
        console.log(Math.pow(alt_m,2) * 26)
        console.log("SOY MUJER")
        return Math.pow(alt_m,2) * 22;
    }
}

module.exports = router;