const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imagen:    { data: Buffer, contentType: String },
    altura:   { type: Number, require: true},
    peso_actual: { type: Number, require: true},
    peso_deseado: { type: Number, require: true}, //Peso que quiere obtener el user
    peso_ideal: { type: Number, require: true}, //Peso ideal para las caracteristicas del user
    fecha_nacimiento: { type: Date, require: true},
    fecha_creacion: { type: Date, require: true},
    fechas: [Date],
    pesos: [Number],
    email: { type: String, required: true, unique: true },
    sexo: {type: String, require: true},
    IMC: { type: Number, required: true },
    validado: { type: Boolean, required: true, default: false },
    dieta_recomendada: { type: mongoose.Schema.Types.ObjectId, ref: 'Dieta', default: null},
    url_img: {type: String, required: true, default: "no"}
}, { collection: 'Users' });

module.exports = mongoose.model('Users', UserSchema);