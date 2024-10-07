const config = require('../config/index');
const { expressjwt: jwtt} = require('express-jwt');
const userService = require('../services/user.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;

    return jwtt({ secret, isRevoked, algorithms: ['HS256']}).unless({
        path: [
            //user
            '/user/signin',
        ]
    })
}

async function isRevoked(req, payload) {
    console.log(req);
    const url = req.originalUrl;
    
    if(url.includes('user/') == true) {
        let param = { id: payload, role: "subscriber" || "ambassador" };

    }
}