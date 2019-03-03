// requiere
var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

// inicializar variabes
var app = express();
var Hospital = require('../models/hospital');



// ========================================== 
// Método que permite consultar todos los hospitales registrados 
// ==========================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);


    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (error, hospital) => {

                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio en error al realizar la consuta de hospitales',
                        errors: error
                    });
                }

                if (hospital.length <= 0) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existen Hospitales para mostrar',
                        errors: error
                    });
                }

                Hospital.count({}, (error, conteo) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: 'Todos los hospitales consultados correctamente',
                        hospital: hospital,
                        total: conteo
                    });
                });

            });

});


// ========================================================
// Método que permite consultar un hospital por id
// ========================================================
app.get('/:id',(req,res)=>{
    var id = req.params.id;

    Hospital.findById(id)
    .populate('usuario','nombre img email')
    .exec((err,hospital)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if(!hospital){

            return res.status(400).json({
                ok: false,
                mensaje: 'no se encontro un hospitital con el id '  +  id  + ' seleccionado',
                errors: {mensaje: 'No existe un hospital con ese ID'}
            });
        }

        return res.status(200).json({
            ok: false,
            mensaje:  'hospital encontrado correctamente',  
            hospital
        });
    });
});



// ========================================== 
// Método que permite crear un nuevo hospital 
// ==========================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuerioMD._id
    });

    hospital.save((error, hospitaGuardado) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Ocurrrio un error al guardar el nuevo hospital ',
                errors: error
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'El hospital se creo correctamente ',
            hospitarNuevo: hospitaGuardado
        });

    });
});


// ========================================== 
// Método que permite actualizar un hospital 
// ==========================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var idUsuario = req.params.id;
    var body = req.body;

    Hospital.findById(idUsuario, (error, hospital) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Ocurrior un error al consultar el hospital  ',
                errors: error
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Hospital no existe ',
                errors: error
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuerioMD._id;

        hospital.save((error, hospitarActualizado) => {

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No es posible actualizar el hospital',
                    errors: error
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'El hospital se actualizo correctamnete ',
                hospital: hospitarActualizado
            });

        });


    });

});

// ========================================== 
// Método que permite eliminar un hospital 
// ==========================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var idEliminar = req.params.id;

    Hospital.findByIdAndRemove(idEliminar, (error, hospitalEliminado) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No es posible eliminar el registro ',
                errors: error
            });
        }

        if (!hospitalEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital a eliminar no existe  ',
                errors: error
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'El hospital fue eliminado correctamente ',
            hospital: hospitalEliminado
        });
    });

});


module.exports = app;