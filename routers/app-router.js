// requieres
var express = require('express');

//inicializar variables
var app = express();

// rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'App-router La petición se realizo correctamente'
    })
});

module.exports = app;