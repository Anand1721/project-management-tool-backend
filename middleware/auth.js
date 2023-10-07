require("dotenv").config();

const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('authorization').replace('Bearer ', '')
        const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findOne({ _id, 'accessTokens.token': token })
        if (!user) {
            throw new jwt.JsonWebTokenError()
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({
            'message': error?.toString()
        })
    }
}

module.exports = auth