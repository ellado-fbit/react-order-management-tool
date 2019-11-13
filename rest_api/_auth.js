let jwt = require('jsonwebtoken')
const config = require('./_config')

const authenticate = (req, res, next) => {

  // Routes not included in the following REST paths list will skip the authentication...
  // -------------------------------------------------------------------------------------
  if (!/^\/providers/.test(req.path) &&
      !/^\/hotels/.test(req.path) &&
      !/^\/items/.test(req.path) &&
      !/^\/contracts/.test(req.path) &&
      !/^\/orders/.test(req.path) &&
      !/^\/store_type_ids/.test(req.path) &&
      !/^\/preorders/.test(req.path) &&
      !/^\/orders_reports/.test(req.path)
    ) { return next() }

  let token = req.query.token || req.headers['authorization'] || ''

  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length)
  }

  if (token === 'null') {
    token = null
  }

  if (token) {
    jwt.verify(token, config.secret_key, (err, decoded) => {
      if (err) {
        return res.json({ error: 'INVALID_TOKEN' })
      }
      else {
        req.tokenPayload = decoded
        return next()
      }
    })
  }
  else {
    return res.json({ error: 'REQUIRED_TOKEN' })
  }

}

module.exports = authenticate
