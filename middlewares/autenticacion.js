var jwt = require('jsonwebtoken');
var SEED = require('../Config/config').SEED; //Variables de configuración


// ========================================== 
// Verificar token 
// ==========================================
exports.verificarToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto ',
                errors: error
            });
        }

        req.usuerioMD = decoded.usuario;

        next();

    });

};