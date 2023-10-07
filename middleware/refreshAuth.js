require("dotenv").config();

const jwt = require('jsonwebtoken')
const User = require('../models/user')

const refreshAuth = async (req, res, next) => {
    try {
        const token = req.header('authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'refreshTokens.token': token })
        if (!user) {
            throw new jwt.JsonWebTokenError()
        }
        const accessToken = jwt.sign({
            _id: user._id.toString(),
            email: user.email
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h'
        });
        user.accessTokens = user.accessTokens.concat({ token: accessToken })
        await user.save()
        req.accessToken = accessToken
        next()
    } catch (error) {
        res.status(422).json({
            message: error?.toString()
        })
    }
}

module.exports = refreshAuth