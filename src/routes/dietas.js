const router = require('express').Router();
const Dieta = require('../models/Dieta');
var path = require('path');

router.post('/register', async (req, res) => {

    var dias_json = req.body.dias
    try {
        const dieta = new Dieta({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            objetivo: req.body.objetivo,
            dias: dias_json
        });
        const savedDieta = await dieta.save();
        if (isEmpty(savedDieta)) {
            return res.status(400).json("Internal DB error");
        }
        return res.status(200).json(savedDieta)
    } catch(err) {
        res.status(413).json(err);
    }
});

router.get('/info/:id', async (req, res) => {
    var id = req.params.id
    try {
        const inf_dieta = await Dieta.findById({_id: id})
        if (isEmpty(inf_dieta)) {
            return res.status(400).json("No existe");
        }
        return res.status(200).json(inf_dieta)
    } catch(err) {
        res.status(413).json(err);
    }
});

router.get('/', async (req, res) => {
    try {
        const dietas = await Dieta.find()
        if (isEmpty(dietas)) {
            return res.status(400).json("No hay dietas");
        }
        let response = []
        for (let i=0; i < dietas.length; i++) {
            let aux = {nombre: dietas[i].nombre, id: dietas[i]._id}
            response.push(aux)
        }
        return res.status(200).json(response)
    } catch(err) {
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