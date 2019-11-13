const express = require('express')
const ObjectID = require('mongodb').ObjectID
const utils = require('./_utils_schemas')
const moment = require('moment')

const create_router = (config, mongo_collection, schema, router_name) => {

  // Extract unique field (only one unique field by schema)
  const unique_field = schema.filter((x) => { return x.isUnique }).map((x) => { return x.fieldName })[0]

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

  // Get schema
  // -----------
  router.get('/schema', (req, res) => { res.json(schema) })

  // -------
  // Create
  // -------
  router.post('/', (req, res) => {

    // Check user grant
    // -----------------
    if (!req.tokenPayload.isAdmin && router_name !== 'orders') {
      return res.json({ error: `Error: El usuario '${req.tokenPayload.username}' no está autorizado para hacer esta operación HTTP ${req.method}.`})
    }

    if (router_name === 'orders' && req.body.hotel_username !== req.tokenPayload.username) {
      return res.json({ error: 'Error: No puede crear un pedido asignado a otro hotel' })
    }

    // Check allowed fields and mandatory fields, and allowed values
    // --------------------------------------------------------------
    let checkResult = {}

    checkResult = utils.checkAllowedFields(schema, Object.keys(req.body))
    if (checkResult.error) { return res.json(checkResult) }

    checkResult = utils.checkMandatoryFields(schema, Object.keys(req.body))
    if (checkResult.error) { return res.json(checkResult) }

    checkResult = utils.checkAllowedValues(schema, req.body)
    if (checkResult.error) { return res.json(checkResult) }

    // Filling creation_date
    // ----------------------
    if (req.body.hasOwnProperty('creation_date')) {
      req.body.creation_date = moment().format('YYYY/MM/DD')
    }

    // Inserting...
    // -------------
    mongo_collection.insertOne(req.body, (err, docInserted) => {
      if (!err) {
        if (!unique_field) {
          return res.json({ ok: 'OK', docInserted: req.body })
        }
        else {  // only creates unique index if unique_field exists
          let field_to_index = {}
          field_to_index[unique_field] = 1

          mongo_collection.createIndex(field_to_index, { unique: true }, (error, indexName) => {
            if (!error) {
              return res.json({ ok: 'OK', docInserted: req.body })
            }
            else {
              return res.json({ error: error })
            }
          })
        }
      }
      else {
        const err_re = /duplicate key error/.exec(err)

        if (err_re && unique_field) {
          return res.json({ error: `Error: Ya existe un registro con el mismo valor en el campo '${unique_field}'. Proporcione otro valor distinto.` })
        }
        else {
          return res.json({ error: err })
        }
      }
    })

  })

  // -----
  // Read
  // -----
  router.get('/id/:id', (req, res) => {

    const query = {}

    if (req.params.id !== '--all--') {
      if (!/^[0-9A-Fa-f]{24}$/.test(req.params.id)) {
        return res.json({ error: 'Error: Campo \'id\' debe ser un string de 24 caracteres hexadecimales.' })
      }
      query['_id'] = new ObjectID(req.params.id)
    }

    // If router_name is 'hotels', then set username based on token info
    // ------------------------------------------------------------------
    if (!req.tokenPayload.isAdmin && router_name === 'hotels') {
      query.username = req.tokenPayload.username
    }

    // If router_name is 'orders', then set username based on token info
    // ------------------------------------------------------------------
    if (!req.tokenPayload.isAdmin && router_name === 'orders') {
      query.hotel_username = req.tokenPayload.username
    }

    // Set sorting field
    // ------------------
    const sortByField = {}
    if (router_name === 'orders') {
      sortByField['creation_date'] = -1
    }
    else if (router_name === 'contracts') {
      sortByField['provider_code'] = 1
      sortByField['store_id'] = 1
    }
    else {
      sortByField['name'] = 1
    }

    mongo_collection.find(query).limit(0).sort(sortByField).toArray((err, items) => {
      if (!err) {
        return res.json(items)
      }
      else {
        return res.json({ error: err })
      }
    })

  })

  // -------
  // Update
  // -------
  router.put('/id/:id', (req, res) => {

    // Check user grant
    // -----------------
    if (!req.tokenPayload.isAdmin && router_name !== 'orders') {
      return res.json({ error: `Error: El usuario '${req.tokenPayload.username}' no está autorizado para hacer una operación HTTP ${req.method}.`})
    }

    if (!req.tokenPayload.isAdmin && router_name === 'orders') {
      if (req.body.hotel_username !== req.tokenPayload.username) {
        return res.json({ error: 'Error: No puede modificar un pedido asignado a otro hotel' })
      }
      if (req.body.delivery_dates) {
        return res.json({ error: 'Error: No puede modificar las fechas de entrega' })
      }
    }

    // Check id type
    // --------------
    if (!/^[0-9A-Fa-f]{24}$/.test(req.params.id)) {
      return res.json({ error: 'Error: Campo \'id\' debe ser un string de 24 caracteres hexadecimales.' })
    }

    // Unique field can not be modified
    // ---------------------------------
    if (Object.keys(req.body).includes(unique_field)) {
      return res.json({ error: `Error: El campo '${unique_field}' no puede ser modificado para mantener integridad referencial.` })
    }

    // Check allowed fields and allowed values
    // ----------------------------------------
    let checkResult = {}

    checkResult = utils.checkAllowedFields(schema, Object.keys(req.body))
    if (checkResult.error) { return res.json(checkResult) }

    checkResult = utils.checkAllowedValues(schema, req.body)
    if (checkResult.error) { return res.json(checkResult) }

    // Prepare update
    // ---------------
    const query = { _id: new ObjectID(req.params.id) }
    const setContent = { $set: req.body }

    // Updating ...
    // -------------
    mongo_collection.updateOne(query, setContent, (err, result) => {
      if (!err) {
        if (result.result.n === 1) {
          return res.json({ ok: 'OK' })
        }
        else {
          if (router_name === 'orders') {
            return res.json({ error: 'ORDER_NOT_EXIST' })
          } else {
            return res.json({ error: `Error: El registro con _id = '${req.params.id}' no existe.` })
          }
        }
      }
      else {
        return res.json({ error: err })
      }
    })

  })

  // -------
  // Delete
  // -------
  router.delete('/id/:id', (req, res) => {

    // Check user grant
    // -----------------
    if (!req.tokenPayload.isAdmin && router_name !== 'orders') {
      return res.json({ error: `Error: El usuario '${req.tokenPayload.username}' no está autorizado para hacer una operación HTTP ${req.method}.`})
    }

    if (!/^[0-9A-Fa-f]{24}$/.test(req.params.id)) {
      return res.json({ error: 'Error: Campo \'id\' debe ser un string de 24 caracteres hexadecimales.' })
    }

    const query = { _id: new ObjectID(req.params.id) }

    mongo_collection.deleteOne(query, (err, result) => {
      if (!err) {
        if (result.result.n === 1) {
          return res.json({ ok: 'OK' })
        }
        else {
          return res.json({ error: `Error: El registro con _id = '${req.params.id}' no existe.` })
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
