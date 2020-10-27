const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    Usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    Proteinas: { type: Number, required: true },
    Sodio: { type: Number, required: true },
    Azucar: { type: Number, required: true },
    Carbohidratos: { type: Number, required: true },
    Grasas: { type: Number, required: true },
    Fibra: { type: Number, required: true },
    Kcal: { type: Number, required: true }
}, { collection: 'Plan' });

module.exports = mongoose.model('Plan', PlanSchema);