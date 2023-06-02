const express = require('express')
const router = express.Router()
const barangReject = require('../controller/barangReject.controller')

router.get('/', barangReject.findAll)
router.get('/search', barangReject.search)

router.put('/:id', barangReject.update)

router.delete('/:id', barangReject.delete)

module.exports = router