const router = require('express').Router();
const Plan = require('../models/Plan');
var path = require('path');

router.get('/:idUser', async (req, res) => {
    var id = req.params.idUser
    try{
        const plan = await Plan.findOne({ Usuario: id })
        if (plan === null) return res.status(411).json('Usuario no tiene plan');
        else {
           return res.status(200).send(plan);
        }
    } catch(err) {
        console.log("error: " + err)
        res.status(413).json(err);
    }
});
module.exports = router;