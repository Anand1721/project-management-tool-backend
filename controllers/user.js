const User = require("../models/user");
const bcrypt = require('bcryptjs');

module.exports.userSignup = async (req, res) => {
    try {
        const {
            name,
            gender,
            dob,
            email,
            mobile,
            password
        } = req.body;
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                message: 'User already exists'
            })
        }
        const newUser = new User({
            name,
            gender,
            dob,
            email,
            mobile,
            password
        })
        const savedUser = await newUser.save()
        const tokens = await savedUser.generateTokens()
        return res.send({ user: savedUser, tokens, message: 'User registration successful!' })
    } catch (error) {
        return res.status(400).json({
            message: error?.toString()
        })
    }
}

module.exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req?.user?._id)
            .lean()
            .exec()
        if (!user) {
            res.status(400).json({
                message: 'User not found!'
            })
        }
        return res.status(200).json({
            user
        })
    } catch (error) {
        return res.status(500).json({
            message: 'An unexpected error occured!'
        })
    }
}