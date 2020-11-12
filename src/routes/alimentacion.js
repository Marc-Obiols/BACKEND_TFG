const router = require('express').Router();
const User = require('../models/Alimentacion');
var path = require('path');
const Alimentacion = require('../models/Alimentacion');

router.post('/addAlimento/:id', async (req, res) => {
    var id = req.params.id
    try {
        const alimentacion = await Alimentacion.find({propietario: id});
        if (!alimentacion) return res.status(411).json('no existe alimentacion con ese id');

        var ultimo_element = alimentacion[0].registro[alimentacion[0].registro.length-1]
        var rut = {id_alimento: req.body.id_alimento, cantidad: req.body.cantidad};
        ultimo_element.alimentos.push(rut)
        ultimo_element.kcal += (req.body.kcal*req.body.cantidad)/100
        ultimo_element.fibra += (req.body.fibra*req.body.cantidad)/100
        ultimo_element.proteina += (req.body.proteina*req.body.cantidad)/100
        ultimo_element.carbo += (req.body.carbo*req.body.cantidad)/100
        ultimo_element.grasas += (req.body.grasas*req.body.cantidad)/100

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

//get de la alimentacion del dia actual
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


function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

module.exports = router;