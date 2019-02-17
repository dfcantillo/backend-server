// requieres
var express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');

//inicializar variables
var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// default options
app.use(fileUpload());

// rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var idUsuario = req.params.id;

    // tipo de colecciónes donde se puede guardar las imagenes
    var tipoDeColeccion = ['hospitales', 'medicos', 'usuarios'];
    if (tipoDeColeccion.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No es tipo de coleccion valida',
            errors: { message: 'No es tipo de coleccion valida solo se puede guardar en :' + tipoDeColeccion.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleciono una imagen',
            errors: { message: 'No ha selecionado ninguna imagen' }
        });
    }
    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1].toLowerCase();

    // Extensiones validas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // Validar si el archivo tiene una extensión valida
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no validad',
            errors: { message: 'Las estensiones validas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${idUsuario}-${new Date().getMilliseconds()}.${extensionArchivo}`;
    // mover el archivo del temporar al un path en espeficio
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;//nombre del path


    //Mover el archivo 
    archivo.mv(path, (error) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: { message: error }
            });
        }

        subirPorTipo(tipo, idUsuario, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'El archivo movido correctamente',
        //     extensionArchivo: extensionArchivo
        // })

    });



});

// ========================================== 
// Funciones que permite o modificar archivo por tipo 
// ==========================================
function subirPorTipo(tipo, id, nombreArchivo, res) {
    var coleccion = '';
    if (tipo === 'usuarios') { coleccion = Usuario };
    if (tipo === 'hospitales') { coleccion = Hospital };
    if (tipo === 'medicos') { coleccion = Medico };

    if (coleccion) {
        // Variable utilizada para mostrar en nombre de la colección en singular
        var nombreColeccion = (tipo === 'hospitales') ? tipo.substring(0, tipo.length - 2) : tipo.substring(0, tipo.length - 1);
        coleccion.findById(id, (error, tabla) => {

            // Se valida si exite el registro con el identificador 
            if (!tabla) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El identificador  ha actualizar no existe',
                    errors: { message: 'El identificador ha actualizar no existe' }
                });
            }
            var pathViejo = `./uploads/${tipo}/${tabla.img}`;


            // Si existe se elimina
            if (fs.existsSync(pathViejo)) {
                console.log('eliminación',pathViejo);
                fs.unlinkSync(pathViejo);
            }


            // se actualiza el path de la imagen en la db
            tabla.img = nombreArchivo;
            tabla.save((error, registroActualizado) => {

                // Para no mostrar la constraseña
                if (coleccion === Usuario) {
                    tabla.password = ':-D';
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del ' + nombreColeccion + ' actualizada correctamente ',
                    [nombreColeccion]: registroActualizado
                });
            });
        });
    } else {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha encontrado una colección valida para actualizar la imagen'
        });
    }
}



module.exports = app;