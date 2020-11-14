const router = require('express').Router();
const User = require('../models/Alimentacion');
var path = require('path');
const Alimentacion = require('../models/Alimentacion');

//Añadir un alimento
router.post('/addAlimento/:id', async (req, res) => {
    var id = req.params.id
    console.log((parseFloat(8.94)+parseFloat(16.5)).toFixed(2))
    try {
        const alimentacion = await Alimentacion.find({propietario: id});
        if (!alimentacion) return res.status(411).json('no existe alimentacion con ese id');

        var ultimo_element = alimentacion[0].registro[alimentacion[0].registro.length-1]
        var rut = {id_alimento: req.body.id_alimento, cantidad: req.body.cantidad, nombre_al: req.body.nombre_al, 
            kcal_al: req.body.kcal, fibra_al: req.body.fibra, proteina_al: req.body.proteina, carbo_al: req.body.carbo, grasas_al: req.body.grasas};

        ultimo_element.alimentos.push(rut)
        ultimo_element.kcal = (parseFloat(ultimo_element.kcal) + parseFloat((req.body.kcal*req.body.cantidad)/100)).toFixed(2)
        ultimo_element.fibra = (parseFloat(ultimo_element.fibra) + parseFloat((req.body.fibra*req.body.cantidad)/100)).toFixed(2)
        ultimo_element.proteina = (parseFloat(ultimo_element.proteina) + parseFloat((req.body.proteina*req.body.cantidad)/100)).toFixed(2)
        ultimo_element.carbo = (parseFloat(ultimo_element.carbo) + parseFloat((req.body.carbo*req.body.cantidad)/100)).toFixed(2)
        ultimo_element.grasas = (parseFloat(ultimo_element.grasas) + parseFloat((req.body.grasas*req.body.cantidad)/100)).toFixed(2)

        alimentacion[0].registro[alimentacion[0].registro.length-1] = ultimo_element

        console.log(ultimo_element)
        const AlimentacionMod = await Alimentacion.findByIdAndUpdate({ _id: alimentacion[0]._id }, {
            registro: alimentacion[0].registro
        });
        if (!AlimentacionMod) return res.status(412).json('Error al modificar');
        AlimentacionMod.registro[AlimentacionMod.registro.length-1] = ultimo_element
        res.status(200).json(AlimentacionMod.registro[AlimentacionMod.registro.length-1]);
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

//get de la alimentacion del dia actual; falta añadir limite de 30 dias para historial
router.get('/dia/:id', async (req, res) => {
    var id = req.params.id
    try {
        const alimentacion = await Alimentacion.find({propietario: id});
        if (!alimentacion) return res.status(411).json('no existe alimentacion con ese id');
        if(isEmpty(alimentacion[0].registro)) {
            newregistro = {
                kcal: 0, 
                fibra: 0,
                proteina: 0,
                carbo: 0,
                grasas: 0,
                fecha: Date.now(),
                alimentos: []
            }
            var id_ali = alimentacion[0]._id
            const AlimentacionMod = await Alimentacion.findByIdAndUpdate({ _id: id_ali }, {
                registro: newregistro
            });
            return res.status(200).json(newregistro);
        }
        var fecha_aux = alimentacion[0].registro[alimentacion[0].registro.length-1].fecha
        var today = new Date();
        if (fecha_aux.getDate() == today.getDate() && fecha_aux.getMonth() == today.getMonth() && fecha_aux.getFullYear() && today.getFullYear()) {
            res.status(200).json(alimentacion[0].registro[alimentacion[0].registro.length-1]); 
        }
        else {
            newregistro = {
                kcal: 0, 
                fibra: 0,
                proteina: 0,
                carbo: 0,
                grasas: 0,
                fecha: Date.now(),
                alimentos: []
            }
            var id_ali = alimentacion[0]._id
            alimentacion[0].registro.push(newregistro)
            const AlimentacionMod = await Alimentacion.findByIdAndUpdate({ _id: id_ali }, {
                registro: alimentacion[0].registro
            });
            res.status(200).json(newregistro);
        }

    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});

router.post('/removeAlimento', async (req, res) => {

    var id_user = req.body.id_user
    var pos = req.body.posicion
    try{
        const alimentacion = await Alimentacion.find({propietario: id_user});
        if (!alimentacion) return res.status(411).json('no existe alimentacion con ese id');

        var alimento = alimentacion[0].registro[alimentacion[0].registro.length-1].alimentos[pos]
        console.log(alimento)
        alimentacion[0].registro[alimentacion[0].registro.length-1].kcal -= (alimento.kcal_al*alimento.cantidad/100).toFixed(2)
        alimentacion[0].registro[alimentacion[0].registro.length-1].fibra -= (alimento.fibra_al*alimento.cantidad/100).toFixed(2)
        alimentacion[0].registro[alimentacion[0].registro.length-1].proteina -= (alimento.proteina_al*alimento.cantidad/100).toFixed(2)
        alimentacion[0].registro[alimentacion[0].registro.length-1].grasas -= (alimento.grasas_al*alimento.cantidad/100).toFixed(2)
        alimentacion[0].registro[alimentacion[0].registro.length-1].carbo -= (alimento.carbo_al*alimento.cantidad/100).toFixed(2)
        alimentacion[0].registro[alimentacion[0].registro.length-1].alimentos.splice(pos, 1)

        console.log(alimentacion[0].registro[alimentacion[0].registro.length-1])

        const AlimentacionMod = await Alimentacion.findByIdAndUpdate({ _id: alimentacion[0]._id }, {
            registro: alimentacion[0].registro
        });
        if (!AlimentacionMod) return res.status(412).json('Error al modificar');
        AlimentacionMod.registro[AlimentacionMod.registro.length-1] = alimentacion[0].registro[alimentacion[0].registro.length-1]
        console.log(AlimentacionMod.registro[AlimentacionMod.registro.length-1])
        res.status(200).json(AlimentacionMod.registro[AlimentacionMod.registro.length-1]);

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