// requieres
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

//inicializar variables
var app = express();


//Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// importación de rutas
var appRouter = require('./routers/app-router');
var usuarioRouter = require('./routers/usuario');
var loginRouter = require('./routers/login');
var hospitalRouter = require('./routers/hospital');
var medicoRouter = require('./routers/medico');
var busquedaRouter = require('./routers/busqueda');
var uploadRouter = require('./routers/upload');
var imagenesRouter = require('./routers/imagenes');


// conexion a DB
mongoose.connect('mongodb://localhost:27017/hostpitalDB', (error, resp) => {
    if (error) throw error;
    console.log('La conexión a mongo db se realizo correctamente');
});


// server index config , permite  hacer los archivos publicos desde el cliente con solo llamar la ruta Uploads
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));


// Rutas
app.use('/usuario', usuarioRouter);
app.use('/login', loginRouter);
app.use('/hospital', hospitalRouter);
app.use('/medico', medicoRouter);
app.use('/busqueda', busquedaRouter);
app.use('/upload', uploadRouter);
app.use('/img', imagenesRouter);
app.use('/', appRouter);




//poner a escuchar el servidor : 3000 es el puerto por donde correra
app.listen(3000, () => {
    console.log("Expess server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m", " online");

});