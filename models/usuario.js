var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
//Declaración del esquema del objeto
var Schema = mongoose.Schema;


var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'El correo es necesario'] },
    img: { type: String, required: false },
    role: { type: String, required: [true, 'El rol es necesario'], default: 'USER_ROLE', enum: rolesValidos }
});

// Permite decodificar mensaje de error
usuarioSchema.plugin(uniqueValidator, { message: 'El {PATH} debe ser unico' });

module.exports = mongoose.model('Usuarios', usuarioSchema);