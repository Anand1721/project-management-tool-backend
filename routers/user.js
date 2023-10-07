const express = require("express");
const auth = require("../middleware/auth");

const {
    userSignup,
    getUser,
} = require("../controllers/user");

const router = express.Router();

router.post('/register', userSignup)
router.get('/current', auth, getUser)

module.exports = router