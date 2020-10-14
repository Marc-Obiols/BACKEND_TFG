// Rutas sobre usuarios
const router = require('express').Router();
const User = require('../models/User');
const crypto = require('crypto');

router.post('/users/register', async (req, res) => {

    console.log('HOLA');
    console.log(req.body);
    const user = new User({
        username: req.body.username,
        password: req.body.created
    });

    const savedUser = await user.save();
    console.log(savedUser);
    res.status(200).json(savedUser);
});

router.get('/users/login', (req, res) => {
    res.send('se ha iniciado sesion de puta madre');
});

module.exports = router;