let jwt = require('jsonwebtoken')
const express = require('express')
const utils = require('./_utils_schemas')

const create_router = (config, mongo_collection, schema) => {

  const router = express.Router()

  // ------------------------------------
  // Login user to create JSON Web Token
  // ------------------------------------
  router.post('/', (req, res) => {

    // Check allowed fields and mandatory fields
    // ------------------------------------------
    let checkResult = {}

    checkResult = utils.checkAllowedFields(schema, Object.keys(req.body))
    if (checkResult.error) { return res.json(checkResult) }

    checkResult = utils.checkMandatoryFields(schema, Object.keys(req.body))
    if (checkResult.error) { return res.json(checkResult) }

    mongo_collection.find({}, { projection: {_id: 0, username: 1, pwd: 1} }).limit(0).toArray((err, items) => {
      if (!err) {

        const users = items.concat([ config.admin_user ])
        let current_user = users.filter((x) => { return x.username === req.body.username })

        if (current_user.length === 0) {
          return res.json({ error: `Usuario desconocido!` })
        }

        current_user = current_user[0]

        if (current_user.pwd !== req.body.pwd) {
          return res.json({ error: 'Password incorrecto!' })
        }
        else {
          let payload = { username: req.body.username }

          if (current_user.isAdmin) {
            payload.isAdmin = true
          }

          // Generate token
          // ---------------
          let token = jwt.sign(payload, config.secret_key, { expiresIn: '24h' })

          const result = {
            ok: 'OK',
            message: `Autenticación exitosa para '${req.body.username}'. Disfruta tu token durante 24 horas.`,
            username: req.body.username,
            isAdmin: (current_user.isAdmin) ? true : false,
            token: token
          }
          res.json(result)
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
