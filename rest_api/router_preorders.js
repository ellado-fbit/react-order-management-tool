const express = require('express')
const _ = require('lodash')
const store_ids = require('./_store_type_ids')

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

  // --------------------------------------------------------------------------
  // Endpoint to generate order templates (pre-orders) based on contracts.
  // It will be used to show a pre-orders select form before launching orders.
  // --------------------------------------------------------------------------
  router.get('/generate_preorders', (req, res) => {

    // Check user
    // -----------
    if (req.tokenPayload.isAdmin) {
      return res.json({ error: `Error: El usuario 'admin' no está autorizado para lanzar pedidos (sólo validarlos y cerrarlos).`})
    }

    // ======================
    // Chaining Promises ...
    // ======================

    // Extract contracts and generate hydrated pre-orders
    // ---------------------------------------------------
    const getPreOrders = () => {
      return new Promise((resolve, reject) => {
        mongo_cols['contracts'].find({}).limit(0).toArray((err, contracts) => {
          if (!err) {

            let preorders = []

            contracts.forEach(contract => {
              let new_preorder = {
                provider_code: contract.provider_code,
                store_id: contract.store_id,
                item_codes: contract.item_codes,
                delivery_dates: '',
                status: 'abierto'
              }

              if (contract.references) new_preorder.references = contract.references

              // Hydrating new pre-order with store name
              // ----------------------------------------
              const storeId = store_ids.find(store => store.id === new_preorder.store_id)
              if (storeId) {
                new_preorder.store_name = storeId.name
                preorders.push(new_preorder)
              } else {
                reject(Error('Tipo de almacén no encontrado!'))
              }

            })

            resolve(preorders)

          } else {
            reject(err)
          }
        })
      })
    }

    // Hydrate with hotel's info
    // --------------------------
    const hydrateWithHotel = ((preorders) => {
      return new Promise((resolve, reject) => {
        mongo_cols['hotels'].find({ username: req.tokenPayload.username }).limit(0).toArray((err, hotels) => {
          if (!err) {
            if (hotels[0]) {
              const hotel = hotels[0]

              preorders.forEach(preorder => {
                preorder.hotel_username = req.tokenPayload.username
                preorder.hotel_name = hotel.name
              })

              resolve(preorders)

            } else {
              reject(Error(`Hotel con username '${req.tokenPayload.username}' no encontrado!`))
            }
          } else {
            reject(err)
          }
        })
      })
    })

    // Hydrate with provider's info
    // -----------------------------
    const hydrateWithProvider = ((preorders) => {
      return new Promise((resolve, reject) => {
        mongo_cols['providers'].find({}).limit(0).toArray((err, providers) => {
          if (!err) {

            preorders.forEach(preorder => {
              let provider = providers.find(provider => provider.code === preorder.provider_code)
              if (provider) {
                preorder.provider_name = provider.name
              } else {
                reject(Error('Proveedor no encontrado!'))
              }
            })

            resolve(preorders)

          } else {
            reject(err)
          }
        })
      })
    })

    // Hydrate with items info
    // ------------------------
    const hydrateWithItems = ((preorders) => {
      return new Promise((resolve, reject) => {
        mongo_cols['items'].find({}).limit(0).toArray((err, items) => {
          if (!err) {

            preorders.forEach(preorder => {
              preorder.item_names = []
              preorder.item_formats = []
              preorder.qtys = []
              preorder.item_codes.forEach(item_code => {
                let item = items.find(item => item.code === item_code)
                if (item) {
                  preorder.item_names.push(item.name)
                  preorder.item_formats.push(item.format)
                  preorder.qtys.push('')
                }
                // else {
                //   reject(Error('Artículo no encontrado!'))
                // }
              })
            })

            resolve(preorders)

          } else {
            reject(err)
          }
        })
      })
    })

    getPreOrders()
      .then((preorders) => {
        return hydrateWithHotel(preorders)
      })
      .then((preorders) => {
        return hydrateWithProvider(preorders)
      })
      .then((preorders) => {
        return hydrateWithItems(preorders)
      })
      .then((preorders) => {

        // Sorting pre-orders
        // -------------------
        preorders.forEach(preorder => {
          preorder.sortable_name = _.deburr(`${preorder.hotel_name} ${preorder.provider_name} ${preorder.store_name}`).toLowerCase()
        })

        preorders = _.sortBy(preorders, ['sortable_name'])

        res.json(preorders)

      })
      .catch((error) => {
        res.json({ error: error.message })
      })

  })

  return router
}

module.exports = create_router
