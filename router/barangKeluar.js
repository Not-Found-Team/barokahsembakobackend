const express = require("express")
const router = express.Router()
const barangKeluar = require("../controller/barangKeluar.controller")

router.get('/', barangKeluar.findAll)
router.get('/search', barangKeluar.search)
router.post('/', barangKeluar.create)
router.put('/:id', barangKeluar.update)
router.delete('/:id', barangKeluar.delete)

module.exports = router