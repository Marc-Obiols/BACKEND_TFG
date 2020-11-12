const mongoose = require('mongoose');

var AlimentoSchema = new mongoose.Schema({ 
    id_alimento: { type: String, required: true},
    cantidad: { type: Number, required: true},
}, { noId: true });

var nutricionSchema = new mongoose.Schema({ 
    kcal: { type: Number, required: true}, 
    fibra: { type: Number, required: true},
    proteina: { type: Number, required: true},
    carbo: { type: Number, required: true},
    grasas: { type: Number, required: true},
    fecha: { type: Date, required: true},
    alimentos: [AlimentoSchema],
}, { noId: true });

const AlimentacionSchema = new mongoose.Schema({
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    registro: [nutricionSchema],
}, { collection: 'Alimentacion' });

module.exports = mongoose.model('Alimentacion', AlimentacionSchema);