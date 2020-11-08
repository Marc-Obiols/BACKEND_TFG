const router = require('express').Router();
const Ejercicio = require('../models/Ejercicio');
const Rutina = require('../models/Rutina');
var path = require('path');
const { findById, findByIdAndUpdate } = require('../models/Ejercicio');

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
        const rutinas = await Rutina.find({propietario: req.params.id});
        let response = [];
        for(let i = 0; i < rutinas.length; i++) {
            var rut = {nombre: rutinas[i].nombre, id:rutinas[i]._id};
            response.push(rut)
        }
        res.status(200).json(response);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});


//Consultar datos de una rutina
router.get('/datos/:id', async (req, res) => {

    try {
        var id = req.params.id
        const rutina = await Rutina.findById({ _id: id });
        if (isEmpty(rutina)) return res.status(403).json("no existe la rutina");
        console.log(rutina)
        return res.status(200).json(rutina);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

//añadir ejercicio a una rutina
router.post('/addEjercicio/:id', async (req, res) => {

    try{
        var id = req.params.id
        const rutina = await Rutina.findById({ _id: id });
        if (isEmpty(rutina)) return res.status(403).json("no existe la rutina");
        var ejercicios = rutina.ejercicios
        var tiempos = rutina.tiempos
        tiempos.push(req.body.tiempo_ejercicio)
        ejercicios.push(req.body.nombre_ejercicio)
        var tiempo_total = rutina.tiempo_total
        if (tiempo_total == 0) tiempo_total += req.body.tiempo_ejercicio
        else tiempo_total += req.body.tiempo_ejercicio + rutina.tiempo_descanso
        console.log(tiempo_total)
        const rutinaMod = await Rutina.findByIdAndUpdate({ _id: id }, {
            ejercicios: ejercicios,
            tiempos: tiempos,
            tiempo_total: tiempo_total
        });
        if (isEmpty(rutinaMod)) return res.status(403).json("no se ha podido añadir el ejercicio");
        console.log(rutinaMod)
        rutinaMod.ejercicios.push(req.body.nombre_ejercicio)
        rutinaMod.tiempos.push(req.body.tiempo_ejercicio)
        rutinaMod.tiempo_total = tiempo_total
        return res.status(200).json(rutinaMod);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

//eliminar
router.post('/eliminar/:id', async (req, res) => {
    var id = req.params.id
    console.log(id + " : " + req.body.id_user)
    try {
        const rutina = await Rutina.findByIdAndDelete({ _id: id })
        if (!rutina) return res.status(411).json('id incorrecto');
        const rutinas = await Rutina.find({propietario: req.body.id_user});
        let response = [];
        for(let i = 0; i < rutinas.length; i++) {
            var rut = {nombre: rutinas[i].nombre, id:rutinas[i]._id};
            response.push(rut)
        }
        console.log(response)
        res.status(200).json(response);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

router.post('/modificar/:id', async (req, res) => {
    var id = req.params.id
    var nombre = req.body.nombre
    var tiempo_descanso = req.body.tiempo_descanso
    var tiempo_total
    try {
        const rutina = await Rutina.findById({ _id: id })
        if (!rutina) return res.status(411).json('id incorrecto');
        if (rutina.tiempos.length == 0)
            tiempo_total = 0
        else if (rutina.tiempo_descanso == tiempo_descanso) {
            tiempo_total = rutina.tiempo_total
        }
        else {
            tiempo_total = rutina.tiempo_total + (tiempo_descanso- rutina.tiempo_descanso)*(rutina.ejercicios.length-1)
        }

        console.log(tiempo_total)
        const rutinaMod = await Rutina.findByIdAndUpdate({ _id: id }, {
            nombre: nombre,
            tiempo_descanso: tiempo_descanso,
            tiempo_total: tiempo_total
        });
        if (!rutinaMod) return res.status(411).json('id incorrecto');
        rutinaMod.nombre = nombre
        rutinaMod.tiempo_descanso = tiempo_descanso
        rutinaMod.tiempo_total = tiempo_total
        return res.status(200).json(rutinaMod);

    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

//eliminar un ejercicio de la rutina
router.post('/eliminarEjercicio/:id', async (req, res) => {
    var id = req.params.id
    var posicion = req.body.posicion
    try {
        const rutina = await Rutina.findById({ _id: id })
        if (!rutina) return res.status(411).json('id incorrecto');
        var tiemp = rutina.tiempos.splice(posicion, 1)
        var ejer = rutina.ejercicios.splice(posicion, 1)
        if (rutina.ejercicios.length == 0) {
            rutina.tiempo_total = 0
        }
        else {
            rutina.tiempo_total = rutina.tiempo_total - (parseInt(tiemp) + rutina.tiempo_descanso)
        }
        const rutinaMod = await Rutina.findByIdAndUpdate({_id: id},{
            ejercicios: rutina.ejercicios,
            tiempos: rutina.tiempos,
            tiempo_total: rutina.tiempo_total
        })
        if (!rutinaMod) return res.status(412).json('id No se ha podido modificar la rutina');
        rutinaMod.ejercicios = rutina.ejercicios
        rutinaMod.tiempos = rutina.tiempos
        rutinaMod.tiempo_total = rutina.tiempo_total
        return res.status(200).json(rutinaMod);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

//modificar un ejercicio de la rutina
router.post('/modEjercicio/:id', async (req, res) => {
    var id = req.params.id
    var posicion = req.body.posicion
    var tiempo_nuev = req.body.tiempo_nuev
    var posicion_nuev = req.body.nueva_posicion
    console.log(posicion_nuev + " : " + posicion)
    try {
        const rutina = await Rutina.findById({ _id: id })
        if (!rutina) return res.status(411).json('id incorrecto')
        if (posicion >= rutina.tiempos.length || posicion < 0) return res.status(413).json('la posocion no es correcta')
        rutina.tiempo_total = rutina.tiempo_total - rutina.tiempos[posicion] + tiempo_nuev
        rutina.tiempos[posicion] = tiempo_nuev
        if (posicion_nuev != posicion) {
            console.log("HOLA")
            var aux_t = rutina.tiempos[posicion]
            var aux_n = rutina.ejercicios[posicion]
            rutina.ejercicios[posicion] = rutina.ejercicios[posicion_nuev]
            rutina.tiempos[posicion] = rutina.tiempos[posicion_nuev]
            rutina.ejercicios[posicion_nuev] = aux_n
            rutina.tiempos[posicion_nuev] = aux_t
        }
        const rutinaMod = await Rutina.findByIdAndUpdate({_id: id},{
            tiempos: rutina.tiempos,
            ejercicios: rutina.ejercicios,
            tiempo_total: rutina.tiempo_total
        })
        if (!rutinaMod) return res.status(412).json('id No se ha podido modificar la rutina');
        rutinaMod.tiempos = rutina.tiempos
        rutinaMod.ejercicios = rutina.ejercicios
        rutinaMod.tiempo_total = rutina.tiempo_total
        return res.status(200).json(rutinaMod);
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