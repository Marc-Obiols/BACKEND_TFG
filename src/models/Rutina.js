const mongoose = require('mongoose');

const RutinaSchema = new mongoose.Schema({
    nombre: { type: String, required: true},
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    tiempo_total: { type: Number, required: true, default: 0},
    tiempo_descanso: { type: Number, required: true},
    tiempos: [Number],
    ejercicios:  [String],
    predeterminada: { type: Boolean, required: true, default: false },
    copias: { type: Number, required: true, default: 0},
}, { collection: 'Rutina' });

module.exports = mongoose.model('Rutina', RutinaSchema);