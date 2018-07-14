// requieres
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

//inicializar variables
var app = express();
var Usuarios = require('../models/usuario');


// ========================================== 
//  Método que permite consultar todos los usuarios
// ==========================================
app.get('/', (req, res, next) => {

    Usuarios.find({}, 'nombre email img role')
        .exec(
            (error, Usuarios) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error obteniendo usuarios',
                        errors: error
                    });
                }
                res.status(200).json({
                    ok: true,
                    mensaje: 'Usuarios obtenidos correctamente',
                    usuario: Usuarios
                });
            });
});





// ========================================== 
// Actualizar usuario 
// ==========================================

app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuarios.findById(id, (error, usuario) => {


        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un usuario',
                errors: error
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe',
                errors: { messaje: 'no existe un usuario con ese id' }
            });
        }
        // si todo sale bien entonces actualizar
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, usuarioActualizado) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: error
                });
            }

            usuarioActualizado.password = ':=)';
            res.status(201).json({
                ok: true,
                usuario: usuarioActualizado,
                usuarioToken: req.usuerioMD
            });


        });

    })

})

// ========================================== 
// Método para guardar un usuaios 
// ==========================================

app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuarios({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioGuardado) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear un usuario',
                errors: error
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuerioMD
        });
    });
});


// ========================================== 
// Borrar un usuario por el id 
// ==========================================

app.delete('/:idUsu', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.idUsu;

    Usuarios.findByIdAndRemove(id, (error, usuarioBorrado) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: error
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No se encontro el usuario a eliminar' }
            });
        }
        usuarioBorrado.password = ':=)';
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuerioMD
        });

    })


})

module.exports = app;