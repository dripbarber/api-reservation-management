const express = require('express');
const router = express.Router();
const { Token } = require('../database')

router.use(async (request, response, next) => {
    try {
        const tokenWithoutPrefix  = (request.headers.authorization || '').slice(7)
        if (!tokenWithoutPrefix) return next()
    
        const token  = await Token.findOne({value: tokenWithoutPrefix}).populate('user')
        if (!token) return next()
    
        const { user } = token
        request.user = user
    
        token.lastActivity = new Date()
        token.save()
        return next()
    } catch (error) {
        response.status(500).json({ message: 'Ocorreu um erro ao validar token de autenticação...' });
    }

})

//Rotas
router.use('/', require('./authRoute'));
router.use('/user', require('./userRoute'));

module.exports = router;