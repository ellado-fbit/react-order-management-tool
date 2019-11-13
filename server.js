const express = require('express')
const path = require('path')
const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')
const cors = require('cors')
const config = require('./rest_api/_config')
const authenticate = require('./rest_api/_auth')
const schemas = require('./rest_api/_schemas')
const create_router = require('./rest_api/_create_router')
const router_login = require('./rest_api/router_login')
const router_store_type_ids = require('./rest_api/router_store_type_ids')
const router_preorders = require('./rest_api/router_preorders')
const router_orders_reports = require('./rest_api/router_orders_reports')

const app = express()

app.use( bodyParser.json({ limit: '50mb' }) )
app.use( cors() )

// Authentication
// ---------------
app.use((req, res, next) => {
  authenticate(req, res, next)
})

if (process.env.PORT) {  // PRODUCTION

  // Serving the React App from 'build' folder
  // ------------------------------------------
  app.use(express.static(path.join(__dirname, 'build')))
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
  })

} else {  // DEVELOPMENT

  // Listing REST API endpoints as root
  // -----------------------------------
  const resources = ['providers', 'hotels', 'items', 'contracts', 'orders', 'store_type_ids', 'login', 'preorders', 'orders_reports'].map((x) => {
    return `http://localhost:${config.node_server_port}/${x}`
  })
  app.get('/', (req, res) => {
    return res.json({ resources: resources })
  })

}


// Function to instantiate REST routers
// -------------------------------------
const instance_routers = (config, mongo_cols) => {
  // Basic routers (based on _create_router)
  app.use('/providers', create_router(config, mongo_cols['providers'], schemas.provider_schema, 'providers'))
  app.use('/hotels', create_router(config, mongo_cols['hotels'], schemas.hotel_schema, 'hotels'))
  app.use('/items', create_router(config, mongo_cols['items'], schemas.item_schema, 'items'))
  app.use('/contracts', create_router(config, mongo_cols['contracts'], schemas.contract_schema, 'contracts'))
  app.use('/orders', create_router(config, mongo_cols['orders'], schemas.order_schema, 'orders'))

  // Specific routers
  app.use('/store_type_ids', router_store_type_ids())
  app.use('/login', router_login(config, mongo_cols['hotels'], schemas.login_schema))  // hotels collection contains username/pwd pairs
  app.use('/preorders', router_preorders(config, mongo_cols, 'preorders'))
  app.use('/orders_reports', router_orders_reports(config, mongo_cols, 'orders_reports'))
}

// Open MongoDB connection
// ------------------------
const collections = Object.keys(config.mongodb_cols)
const opened_collections = {}
let index = 0

MongoClient.connect(config.mongodb_uri, { useNewUrlParser: true }, (err, client) => {
  if (!err) {
    console.log(`\nConnected to ${config.mongodb_uri} ...\n`)

    const db = client.db(config.mongodb_database)
    console.log(`  ... opened database: ${config.mongodb_database}\n`)

    const openMongoCollection = () => {
      db.collection(config.mongodb_cols[collections[index]], (err, collection) => {
        if (!err) {
          console.log(`  ... opened collection: ${config.mongodb_cols[collections[index]]}`)
          opened_collections[collections[index]] = collection

          if ((index + 1) === collections.length) {
            instance_routers(config, opened_collections)
            app.listen(config.node_server_port, () => {
              console.log(`\nServer running on port ${config.node_server_port} ...\n`)
            })
          }
          else {
            index += 1
            openMongoCollection()
          }
        }
        else {
          console.log(err)
          process.exit()
        }
      })
    }
    openMongoCollection()
  }
  else {
    console.log(err)
    process.exit()
  }
})
