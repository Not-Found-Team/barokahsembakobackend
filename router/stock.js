const express = require ('express')
const router = express.Router()
const stock = require ('../controller/stock.controller')

// get method
router.get('/', stock.findAll)
router.get('/search', stock.search)
router.get('/testing', stock.findOne)

// post method
router.post('/', stock.create)

// put method
router.put('/:id', stock.update)

// delete method
router.delete('/:id', stock.delete)

module.exports = router