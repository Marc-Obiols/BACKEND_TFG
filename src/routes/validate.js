const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.get('/:id', async (req, res) => {
    id = req.params.id;
    try {
        const usuario = await User.findOneAndUpdate({ _id: id }, { validado: true });
        if (!usuario) {
            return res.status(402).send('Usuario inexistente');
        } else {
            res.status(200).send("El usuario ha sido validado");
        }
    }
    catch (err) {
        res.status(400).send("Error inesperado");
    }
});

module.exports = router;