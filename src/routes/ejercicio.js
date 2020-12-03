const router = require('express').Router();
var fs = require('fs');
const Ejercicio = require('../models/Ejercicio');
var path = require('path');

router.post('/register', async (req, res) => {
    var valores = req.body.valores
    try{
        for(let i = 0; i < valores.length; i++) {
            var id_img = valores[i].id_img
            const ejercicio = new Ejercicio({
                nombre: valores[i].nombre,
                dificultad: valores[i].dificultad,
                imagen: { data:  fs.readFileSync(path.join(__dirname, '../images/' + id_img + '.jpg')), contentType: 'image/jpg'},
                musculos: valores[i].musculos,
                estiramiento: valores[i].estiramiento,
                id_youtube: valores[i].id_youtube
            });
            const savedEjercicio = await ejercicio.save();
            if (isEmpty(savedEjercicio)) {
                res.status(400).json("Internal DB error");
            }
        }
        return res.status(200).json("Todo correcto"); 
    } catch(err) {
        console.log("ERROR")
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

router.get('/image/:nombre', async (req, res) => {
    var nombre = req.params.nombre;
    try {
        const ejercicioImage = await Ejercicio.findOne({nombre: nombre });
        if (isEmpty(ejercicioImage)) {
            res.status(400).json("Internal DB error");
        }
        res.contentType(ejercicioImage.imagen.contentType);
        res.send(ejercicioImage.imagen.data);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

//Get ejercicios filtrados
router.post('/filtrados', async (req, res) => {


    var dificultad = req.body.dificultad
    var musculos = req.body.musculos
    var nombre = req.body.nombre
    console.log("[" + dificultad + " " + musculos + " " + nombre + "]")
    var estiramiento = req.body.estiramiento //1 estiramientos 0 aerobicos 2 todos

    try {
        const ejercicios = await Ejercicio.find({});
        let nombres_ejercicios = [];
        for(let i = 0; i < ejercicios.length; i++) {
            var aux = 0
            for(let j = 0; j < ejercicios[i].musculos.length; j++) {
                if(musculos.includes(ejercicios[i].musculos[j])) aux = aux + 1
            }

            console.log("Musculos: " + (aux == musculos.length  || musculos[0].localeCompare("") == 0))
            console.log("Estiramiento: " + (ejercicios[i].estiramiento == estiramiento || estiramiento == 2))
            console.log("Nombre: " + (ejercicios[i].nombre.localeCompare(nombre) == 0 || nombre.localeCompare("") == 0))
            console.log("Dificultad: " + (ejercicios[i].dificultad.localeCompare(dificultad) == 0 || dificultad.localeCompare("") == 0))

            if((aux == musculos.length  || musculos[0].localeCompare("") == 0) && 
            (ejercicios[i].nombre.localeCompare(nombre) == 0 || nombre.localeCompare("") == 0) && 
            (ejercicios[i].dificultad.localeCompare(dificultad) == 0 || dificultad.localeCompare("") == 0) && 
            (ejercicios[i].estiramiento == estiramiento || estiramiento == 2)) {
                nombres_ejercicios.push(ejercicios[i].nombre)
            }
        }
        console.log(nombres_ejercicios)
        res.status(200).json(nombres_ejercicios);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

//Get info de un ejercicio
router.get('/:nombre', async (req, res) => {
    var nombre = req.params.nombre;
    try {
        const ejercicio = await Ejercicio.findOne({nombre: nombre });
        if (isEmpty(ejercicio)) {
            res.status(400).json("Internal DB error");
        }
        ejercicio.imagen = null
        return res.status(200).send(ejercicio);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

//Get nombres de todos los ejercicios
router.get('/', async (req, res) => {

    try {
        const ejercicios = await Ejercicio.find({});
        let nombres_ejercicios = [];
        for(let i = 0; i < ejercicios.length; i++) {
            nombres_ejercicios.push(ejercicios[i].nombre)
        }
        res.status(200).json(nombres_ejercicios);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
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