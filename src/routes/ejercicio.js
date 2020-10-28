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
                estiramiento: valores[i].estiramiento
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

router.get('/ejercicio/:nombre', async (req, res) => {
    var nombre = req.params.nombre;
    try {
        const ejercicio = await Ejercicio.findOne({nombre: nombre });
        if (isEmpty(ejercicio)) {
            res.status(400).json("Internal DB error");
        }
        return res.status(200).send(ejercicio);
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