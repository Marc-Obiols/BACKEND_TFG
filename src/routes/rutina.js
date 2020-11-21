const router = require('express').Router();
const Ejercicio = require('../models/Ejercicio');
const Rutina = require('../models/Rutina');
const User = require('../models/User');
var path = require('path');

router.post('/register', async (req, res) => {

    var publica = req.body.publica
    try { //por si existe un user con ese nombre de usuario o email
        var copias= -1
        if (Boolean(publica)) {
            copias = 1
        }
        const rutina = new Rutina({
            nombre: req.body.nombre,
            propietario: req.body.propietario,
            tiempos: [],
            tiempo_descanso: req.body.tiempo_descanso,
            ejercicios:  [],
            copias: copias,
            dificultad: req.body.dificultad
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
            var rut = {nombre: rutinas[i].nombre, id:rutinas[i]._id, tiempo_descanso: rutinas[i].tiempo_descanso, 
                dificultad: rutinas[i].dificultad, copias: rutinas[i].copias};
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
            var rut = {nombre: rutinas[i].nombre, id:rutinas[i]._id, tiempo_descanso: rutinas[i].tiempo_descanso, 
                dificultad: rutinas[i].dificultad, copias: rutinas[i].copias};
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
    var publica = req.body.publica
    var dificultad = req.body.dificultad
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
        var copias
        if (rutina.copias >= 0) { //es publica
            if (!publica) copias = rutina.copias * (-1)
            else copias = rutina.copias
        }
        else {
            if (publica) copias = rutina.copias * (-1)
            else copias = rutina.copias
        }

        console.log(tiempo_total)
        const rutinaMod = await Rutina.findByIdAndUpdate({ _id: id }, {
            nombre: nombre,
            tiempo_descanso: tiempo_descanso,
            tiempo_total: tiempo_total,
            copias: copias,
            dificultad: dificultad
        });
        if (!rutinaMod) return res.status(411).json('id incorrecto');
        rutinaMod.nombre = nombre
        rutinaMod.tiempo_descanso = tiempo_descanso
        rutinaMod.tiempo_total = tiempo_total
        rutinaMod.copias = copias
        rutinaMod.dificultad = dificultad
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
    try {
        const rutina = await Rutina.findById({ _id: id })
        if (!rutina) return res.status(411).json('id incorrecto')
        if (posicion >= rutina.tiempos.length || posicion < 0) return res.status(413).json('la posocion no es correcta')
        rutina.tiempo_total = rutina.tiempo_total - rutina.tiempos[posicion] + tiempo_nuev
        rutina.tiempos[posicion] = tiempo_nuev
        if (posicion_nuev != posicion) {
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

//Get rutinas predeterminadas
router.get('/predeterminada/datos', async (req, res) => {
    
    try {
        const rutinas = await Rutina.find({})
        if (!rutinas) return res.status(411).json('no hay rutinas predeterminadas')
        let response = [];
        for(let i = 0; i < rutinas.length; i++) {
            if (rutinas[i].predeterminada) {
                var rut = {nombre: rutinas[i].nombre, id:rutinas[i]._id, tiempo_descanso: rutinas[i].tiempo_descanso};
                response.push(rut)
            }
        }
        console.log(response)
        return res.status(200).json(response)
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

router.post('/usuarios/datos', async (req, res) => {
    let id = req.body.id
    let usuario_busc = req.body.usuario_busc
    let filtrar = req.body.filtrar
    let dificultad = req.body.dificultad
    
    try {
        const rutinas = await Rutina.find({})
        if (!rutinas) return res.status(411).json('no de otros users')
        let response = [];
        for(let i = 0; i < rutinas.length; i++) {
            if (!rutinas[i].predeterminada) {
                if (rutinas[i].copias >= 0) {
                    var comp = id.localeCompare(rutinas[i].propietario)
                    if (comp != 0) {
                        comp = dificultad.localeCompare(rutinas[i].dificultad)
                        if (comp == 0 || dificultad.localeCompare("todas") == 0) {
                            const usuario = await User.findById({ _id: rutinas[i].propietario });
                            comp = usuario_busc.localeCompare(usuario.username)
                            if (comp == 0 || usuario_busc.localeCompare("") == 0) {
                                var rut = {nombre: rutinas[i].nombre, id:rutinas[i]._id, tiempo_descanso: rutinas[i].tiempo_descanso, 
                                    propietario: usuario.username, copias: rutinas[i].copias, dificultad: rutinas[i].dificultad};
                                response.push(rut)
                            }
                        }
                    }
                }
            }
        }
        if (Boolean(filtrar)) response.sort(function(a, b){
            if(a.copias < b.copias) return 1
            if(a.copias > b.copias) return -1
            return 0;
        });
        console.log(response)
        return res.status(200).json(response)
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

router.post('/copiar/:id', async (req, res) => {

    var id_rutina = req.params.id
    var id_user = req.body.id_user
    try { //por si existe un user con ese nombre de usuario o email
        const rutina_a_copiar = await Rutina.findById({_id: id_rutina});
        if (!rutina_a_copiar) return res.status(411).json('no existe la rutina a copiar')

        const rutina = new Rutina({
            nombre: rutina_a_copiar.nombre,
            propietario: id_user,
            tiempos: rutina_a_copiar.tiempos,
            tiempo_descanso: rutina_a_copiar.tiempo_descanso,
            ejercicios: rutina_a_copiar.ejercicios,
            tiempo_total: rutina_a_copiar.tiempo_total,
            dificultad: rutina_a_copiar.dificultad,
            copias: -1
        });
        const savedRutina = await rutina.save();
        if (isEmpty(savedRutina)) {
            return res.status(400).json("Internal DB error");
        }
        await Rutina.findByIdAndUpdate({_id: id_rutina}, {copias: rutina_a_copiar.copias + 1})
        return res.status(200).json(savedRutina); 
    }  catch(err) {
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