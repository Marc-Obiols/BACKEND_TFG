const router = require('express').Router();
const Ejercicio = require('../models/Ejercicio');
const Rutina = require('../models/Rutina');
var path = require('path');

router.post('/register', async (req, res) => {

    try { //por si existe un user con ese nombre de usuario o email
        const rutina = new Rutina({
            nombre: req.body.nombre,
            propietario: req.body.propietario,
            tiempos: [],
            tiempo_descanso: req.body.tiempo_descanso,
            ejercicios:  []
        });
        const savedRutina = await rutina.save();
        if (isEmpty(savedRutina)) {
            return res.status(400).json("Internal DB error");
        }
        return res.status(200).json(savedRutina); 
    }  catch(err) {
        console.log("ERROR")
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

//Get id y nombre rutinas de un user
router.get('/:id', async (req, res) => {
    try {
        console.log("aqui")
        const rutinas = await Rutina.find({propietario: req.params.id});
        console.log("aqui")
        let response = [];
        for(let i = 0; i < rutinas.length; i++) {
            var rut = {nombre: rutinas[i].nombre, id:rutinas[i]._id};
            response.push(rut)
        }
        console.log("aqui")
        console.log(response)
        res.status(200).json(response);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

router.post('/addEjercicio/:id', async (req, res) => {


});

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = router;