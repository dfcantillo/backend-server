// require
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');


// inializar variables
var app = new express();
var Medico = require('../models/medico');



// ========================================== 
// Método que permite obtener todos lo medicos registrados 
// ==========================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (error, medicos) => {

                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ha ocurrido un error al consultar los medicos ',
                        errors: error
                    });
                }

                if (medicos.length <= 0) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existen medicos registrados actualmente ',
                        errors: error
                    });
                }

                Medico.count({}, (error, conteo) => {

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Medicos consultados corectamente',
                        medicos: medicos,
                        total: conteo
                    });
                });

            })


});


// ========================================== 
// Método que permite registrar un nuevo medico 
// ==========================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {

    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuerioMD._id,
        hospital: body.hospital
    });

    medico.save((error, MedicoCreado) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'A ocurrido un error al crear el nuevo medico ',
                errors: error
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'El medico se creo correctamente  ',
            medico: MedicoCreado

        });

    });

});

// ========================================== 
// Método que permite modificar un medico       
// ==========================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var idAmodificar = req.params.id;
    var body = req.body;

    Medico.findById(idAmodificar, (error, medico) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'A ocurrido un error al modificar e medico',
                errors: error
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico que se desea modifcar no existe ',
                errors: error
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuerioMD;
        medico.hospital = body.hospital;

        medico.save((error, medicoModificado) => {

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No es posible actualizar el registro ',
                    errors: error
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Se ha modificado el medico correctamente ',
                medicoModificado: medicoModificado
            });

        });
    });

});


// ========================================== 
// Método que permite eliminar un medico 
// ==========================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var idEliminar = req.params.id;

    Medico.findByIdAndRemove(idEliminar, (error, medico) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'A ocurrido un error al eliminar un medico  ',
                errors: error
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico a eliminar no existe , no es posible eliminar',
                errors: error
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Se elimino correctamente el registro',
            medico: medico
        });

    });

});


module.exports = app;