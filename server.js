//Module Imports
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')

//Load Environment Variables From .env Files
dotenv.config()

//DB Import
require('./db/mongoose.js')

//Model Imports
const User = require("./models/user");

//Router Imports
const userRouter = require('./routers/user.js')

//Middleware Imports
const auth = require('./middleware/auth.js')
const refreshAuth = require('./middleware/refreshAuth.js')

//Constants
const app = express()
const port = process.env.PORT || 3000

//Middleware
app.use(express.json())
app.use(cors())

//Router Implementations
app.use("/user", userRouter)

//Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        const tokens = await user.generateTokens()
        return res.send({ user, tokens, message: 'Logged In Successfully' })
    } catch (err) {
        return err.toString().startsWith('Error: Invalid Email/Password!') ?
            res.status(400).send({
                message: "Invalid Email or Password"
            }) :
            res.status(500).send({
                message: "Server didn't respond"
            });
    }
})

//Home Route
app.get('/', async (req, res) => {
    try {
        res.send('<h1>Welcome to Project Management Tool</h1>')
    } catch (err) {
        res.status(400).json({
            message: "Error generating refresh token"
        })
    }
})

//Refresh Token
app.get('/refresh', refreshAuth, async (req, res) => {
    try {
        res.status(200).send({
            accessToken: req.accessToken
        })
    } catch (err) {
        res.status(400).json({
            message: "Error generating refresh token"
        })
    }
})

//Logout
app.post('/logout', auth, async (req, res) => {
    try {
        const { authToken, refreshToken } = req.body
        const accessTokens = req.user?.accessTokens?.filter(({ token }) => token !== authToken)
        const refreshTokens = req.user?.refreshTokens?.filter(({ token }) => token !== refreshToken)
        const user = await User.findByIdAndUpdate(req.user?._id, { accessTokens, refreshTokens })
        await user.save();
        res.status(200).json({
            message: "Successfully logged out!!"
        })
    } catch (error) {
        res.status(400).json({
            message: "Error logging out"
        })
    }
})

//Default Route
app.get('*', (req, res) => {
    res.status(404).json({
        "message": "Requested URL not found!"
    });
})

//Setting Up Port For Server To Listen From
app.listen(port, () => {
    console.log("Server is up on port:", port)
})