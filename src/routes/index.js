const router = require('express').Router();

//ruta principal 'localhost:3000'
router.get('/', (req, res) => {
    res.send('Probando');
});

router.get('/about', (req, res) => {
    res.send('About');
});

module.exports = router;