require('dotenv').config()
const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: "No token provided"})
    }

    const token = authHeader.split(' ')[1]
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('decoded: ', decoded)
        req.userId = decoded.userId
        next()
    } catch(err) {
        console.error('JWT error: ', err.message)
        res.status(401).json({error: 'Invalid or expired token'})
    }
}

module.exports = authMiddleware