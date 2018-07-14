// requieres
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../Config/config').SEED; //Variables de configuración

//inicializar variables
var app = express();
var Usuarios = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuarios.findOne({ email: body.email }, (error, usuarioDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios ',
                errors: error
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario ya existe , credenciales incorrectas - email ',
                errors: error
            });
        }


        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password ',
                errors: error
            });
        }

        //Crear toquen

        usuarioDB.password = ':=)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            mensaje: 'Login post correcto ',
            Usuarios: usuarioDB,
            id: usuarioDB.id,
            token: token
        });

    });



})




module.exports = app;