const mongoose = require('mongoose');

const EjercicioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    dificultad: { type: String, required: true },
    imagen:    { data: Buffer, contentType: String },
    musculos: [String],
    estiramiento: { type: Boolean, required: true },
    id_youtube: {type: String, required: true, default: "no tiene"},
}, { collection: 'Ejercicio' });

module.exports = mongoose.model('Ejercicio', EjercicioSchema);