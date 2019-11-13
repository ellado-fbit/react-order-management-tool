const express = require('express')
const store_ids = require('./_store_type_ids')

const create_router = () => {
  const router = express.Router()

  router.get('/', (req, res) => { res.json(store_ids) })

  return router
}

module.exports = create_router
