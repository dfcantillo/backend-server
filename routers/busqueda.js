// requieres
var express = require('express');

//inicializar variables
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ========================================== 
// Método que permite realizar una busqueda especifica 
// ==========================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var coleccion = req.params.tabla;
    var busqueda = req.params.busqueda;
    var exprRegular = new RegExp(busqueda, 'i');
    var promesa;

    switch (coleccion) {
        case 'hospitales':
            promesa = buscarHospitales(exprRegular);
            break;
        case 'medicos':
            promesa = buscarMedicos(exprRegular);
            break;

        case 'usuarios':
            promesa = buscarUsuarios(exprRegular);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'La tabla/colección consulta no existe , verique que sea "hospitales , medicos o usuarios"',
                errors: [{ message: coleccion + ' No es una tabla valida' }]
            });
            break;
    }

    promesa.then((datos, error) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Ocurrio un error al realizar la consulta',
                errors: error
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Se consulto correctamente los ' + coleccion,
            [coleccion]: datos
        });
    });

});



// ========================================== 
// Método que permite realizar una busqueda general 
// ==========================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var expresionRegul = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(expresionRegul),
        buscarMedicos(expresionRegul),
        buscarUsuarios(expresionRegul)
    ]).then((respuestas, error) => {

        if (error) {
            res.status(400).json({
                mensaje: 'ocurrio un error al realizar la consulta',
                error: error
            });

        } else {
            res.status(200).json({
                ok: true,
                mensaje: 'Consulta realizada correctamnete',
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        }

    });

});

// ========================================== 
// Función que permite buscar hospitales por nombre 
// ==========================================
function buscarHospitales(expresionRegul) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: expresionRegul })
            .populate('usuario', 'nombre email role')
            .exec((error, hospitales) => {
                if (error) {
                    reject('Error al buscar hospitales', error);
                } else {
                    resolve(hospitales);
                }
            });
    });
};

// ========================================== 
//Función que permite buscar un medico en la coleción de medicos  
// ==========================================
function buscarMedicos(expresionRegul) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: expresionRegul })
            .populate('usuario', 'nombre email role')
            .populate('hospital')
            .exec((error, medicos) => {
                if (error) {
                    reject('Error al buscar medicos', error);
                } else {
                    resolve(medicos);
                }
            })
    });
};

// ========================================== 
// Función que permite consultar usuarios por nombre o email 
// ==========================================
function buscarUsuarios(expresionRegul) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': expresionRegul }, { 'email': expresionRegul }])
            .exec((error, usuarios) => {
                if (error) {
                    reject('ocurrio un error al consultar usuarios ', error);
                } else {
                    resolve(usuarios);
                }
            });
    });
};

module.exports = app;