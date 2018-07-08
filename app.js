// requieres

var express = require('express');
var mongoose = require('mongoose');

//inicializar variables
var app = express();


// conexion a DB
mongoose.connect('mongodb://localhost:27017/hostpitalDB', (error, resp) => {
    if (error) throw error;

    console.log('La conexión a mongo db se realizo correctamente', resp);

});

// rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'La petición se realizo correctamente'
    })
});


//poner a escuchar el servidor : 3000 es el puerto por donde correra
app.listen(3000, () => {
    console.log("expes server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m", " online");

});