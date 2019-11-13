const express = require('express')
const ObjectID = require('mongodb').ObjectID
const utils_reports = require('./_utils_reports')

const create_router = (config, mongo_cols, router_name) => {

  const router = express.Router()

  const url_base = `${config.restApiUrl}/${router_name}`

  const generate_endpoint = (route) => {
    const endpoint = {
      route_path: `${url_base}${route.path}`,
      method: Object.keys(route.methods)[0].toUpperCase()
    }
    return endpoint
  }

  // Endpoints list of this router
  // ------------------------------
  router.get('/', (req, res) => {
    const endpoints = router.stack
    .filter((x) => { return x.hasOwnProperty('route') }).map((x) => { return generate_endpoint(x.route) })
    res.json({ endpoints: endpoints })
  })

  // ----------------------------------------------
  // Download CSV or PDF of order filtering by _id
  // ----------------------------------------------
  router.get('/format/:format/id/:id', (req, res) => {

    if (!['csv', 'pdf'].includes(req.params.format)) {
      return res.json({ error: 'Error: Valor del campo \'format\' no válido. Valores permitidos: csv, pdf' })
    }

    const query = {}

    if (!/^[0-9A-Fa-f]{24}$/.test(req.params.id)) {
      return res.json({ error: 'Error: Campo \'id\' debe ser un string de 24 caracteres hexadecimales.' })
    }
    query['_id'] = new ObjectID(req.params.id)

    mongo_cols['orders'].find(query).limit(0).toArray((err, orders) => {
      if (!err) {
        if (orders[0]) {
          const order = orders[0]

          // Generate CSV
          // -------------
          if (req.params.format === 'csv') {
            const csv = utils_reports.generate_csv(order)
            res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':`attachment; filename=pedido-${order.hotel_username}-${order.creation_date}.csv`})
            res.end(csv)

          // Generate PDF
          // -------------
          } else {
            utils_reports.generate_pdf(order, res)
          }

        } else {
          return res.json({ error: `Ningún pedido encontrado con id = ${req.params.id}` })
        }
      }
      else {
        return res.json({ error: err })
      }
    })

  })

  return router
}

module.exports = create_router
