const express = require('express')
const router = express.Router()
const users = require('../controller/user.controller')

// create
router.post('/', users.create)

// login
router.get('/', users.findOne)

module.exports = router