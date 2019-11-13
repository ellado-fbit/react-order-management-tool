const node_server_port = 5000

const mongodb_uri = 'mongodb://127.0.0.1:27017'
const mongodb_database = 'orders_manager_db'

// REST API Base URL (only useful to navigate endpoints from browser)
const restApiUrl = `http://localhost:${node_server_port}`

const mongodb_cols = {
  providers: 'providers_col',
  hotels: 'hotels_col',
  items: 'items_col',
  contracts: 'contracts_col',
  orders: 'orders_col'
}

const secret_key = 'MY_SECRET_KEY'

const admin_user = {
  username: 'admin',
  pwd: 'admin',
  isAdmin: true
}

module.exports = {
  node_server_port: node_server_port,
  mongodb_uri: mongodb_uri,
  mongodb_database: mongodb_database,
  restApiUrl: restApiUrl,
  mongodb_cols: mongodb_cols,
  secret_key: secret_key,
  admin_user: admin_user
}
