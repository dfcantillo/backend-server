// requieres
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../Config/config').SEED; //Variables de configuración

//inicializar variables
var app = express();
var Usuario = require('../models/usuario');


// Google
var CLIENT_ID = require('../Config/config').CLIENT_ID; //Variables de configuración
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ========================================== 
// Autenticación con google 
// ==========================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
        // payload: payload
    }
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
}

app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleuser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: ' Token no valido',
                errors: e
            });
        });

    Usuario.findOne({ email: googleuser.email }, (error, usuarioDB) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar el usuario ',
                errors: error
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe iniciar sesión de forma normal no esta registrado con google en la app'
                });
            } else {
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
            }

        } else {
            // usuario no existe
            var usuario = new Usuario;
            usuario.nombre = googleuser.nombre;
            usuario.email = googleuser.email;
            usuario.img = googleuser.img;
            usuario.google = googleuser.google;
            usuario.password = ':=)';

            usuario.save((error, usuarioDB) => {
                usuarioDB.password = ':=)';
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                res.status(200).json({
                    ok: true,
                    mensaje: 'Nuevo usuario Creado con credenciales de google',
                    Usuarios: usuarioDB,
                    id: usuarioDB.id,
                    token: token
                });

            });
        }



    });


    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Autenticación de google correcta',
    //     googleuser: googleuser
    // });

});


// ========================================== 
// Autenticación nomal 
// ==========================================
app.post('/', (req, res) => {


    var body = req.body;

    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {
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
                mensaje: 'Credenciales incorrectas - email ',
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