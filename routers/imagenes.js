// requieres
var express = require('express');

//inicializar variables
var app = express();
var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

//Constantes de node
const path = require('path');
const fs = require('fs');

// rutas
app.get('/:tipo/:img', (req, res, next) => {

    var img = req.params.img;
    var tipo = req.params.tipo;

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagem = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImagem);
    }

});

module.exports = app;