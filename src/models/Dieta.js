const mongoose = require('mongoose');

var DiasSchema = new mongoose.Schema({
    desayuno: [String],
    comida: [String],
    merienda: [String],
    cena: [String],
}, { noId: true });

const DietaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: {type: String, required: true},
    objetivo: {type: String, required: true},
    dias: [DiasSchema],
}, { collection: 'Dieta' });

module.exports = mongoose.model('Dieta', DietaSchema);