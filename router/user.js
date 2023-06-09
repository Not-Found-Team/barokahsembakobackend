const express = require('express')
const router = express.Router()
const users = require('../controller/user.controller')

// create
router.post('/create', users.create)

// login
router.post('/', users.findOne)

module.exports = router