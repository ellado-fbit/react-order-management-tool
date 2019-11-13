import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ContainerForAdminUser from './ContainerForAdminUser'
import ContainerForHotelUser from './ContainerForHotelUser'
import Login from './Login'
import axios from 'axios'

// ---------------------------------------------------------------
// Setting base URL (Notice that Heroku production uses https...)
// ---------------------------------------------------------------
if (/herokuapp.com/.test(`${window.location.hostname}`)) {
  axios.defaults.baseURL = `https://${window.location.hostname}`  // production on Heroku
} else {
  axios.defaults.baseURL = `http://${window.location.hostname}:5000`  // localhost
}

const styles = theme => ({
  root: {
    // flexGrow: 1
  },
  grow: {
    flexGrow: 1
  }
})

class AppContainer extends React.Component {
  state = {
    username: window.localStorage.getItem('username') ? window.localStorage.getItem('username') : '',
    password: '',
    isAdmin: (window.localStorage.getItem('isAdmin') === 'true') ? true : false,
    isLogged: window.localStorage.getItem('token') ? true : false,
    hotels: [],
    providers: [],
    items: [],
    contracts: [],
    storeIds: [],
    orders: [],
    anchorEl: null,  // user account menu
    loginStatus: {error: false, message: ''}
  }

  // Loading resources from MongoDB, and setting session data if passed
  // -------------------------------------------------------------------
  loadResourcesFromMongo = (sessionData = false) => {
    const getHotels = () => { return axios.get('/hotels/id/--all--') }
    const getProviders = () => { return axios.get('/providers/id/--all--') }
    const getItems = () => { return axios.get('/items/id/--all--') }
    const getContracts = () => { return axios.get('/contracts/id/--all--') }
    const getStoreIds = () => { return axios.get('/store_type_ids') }
    const getOrders = () => { return axios.get('/orders/id/--all--') }

    axios.all([getProviders(), getItems(), getHotels(), getContracts(), getStoreIds(), getOrders()])
      .then(axios.spread((providers, items, hotels, contracts, storeIds, orders) => {

        hotels = hotels.data
        providers = providers.data
        items = items.data
        contracts = contracts.data
        storeIds = storeIds.data
        orders = orders.data

        const areThereErrors = (resource) => {
          if (resource.error) {
            console.log(resource.error)
            return true
          }
          else{
            return false
          }
        }

        if (areThereErrors(hotels)) return this.cleaningLoginSession()
        if (areThereErrors(providers)) return this.cleaningLoginSession()
        if (areThereErrors(items)) return this.cleaningLoginSession()
        if (areThereErrors(contracts)) return this.cleaningLoginSession()
        if (areThereErrors(storeIds)) return this.cleaningLoginSession()
        if (areThereErrors(orders)) return this.cleaningLoginSession()

        // Embeding info into contracts
        // -----------------------------
        contracts.forEach((contract) => {

          // adding provider_name
          // ---------------------
          let provider = providers.filter((prov) => { return prov.code === contract.provider_code})
          if (provider.length === 0) {
            contract.provider_name = '--unknown--'
          }
          else {
            contract.provider_name = provider[0].name
          }

          // adding store_name
          // ------------------
          let store = storeIds.filter((sto) => { return sto.id === contract.store_id})
          if (store.length === 0) {
            contract.store_name = '--unknown--'
          }
          else {
            contract.store_name = store[0].name
          }

          // adding item names and formats
          // ------------------------------
          contract.item_names = []
          contract.item_formats = []
          contract.item_codes.forEach((item_code) => {
            let item = items.filter((x) => { return x.code === item_code})
            if (item.length === 0) {
              contract.item_names.push('--unknown--')
              contract.item_formats.push('--unknown--')
            }
            else {
              contract.item_names.push(item[0].name)
              contract.item_formats.push(item[0].format)
            }
          })

        })

        this.setState({ providers, items, hotels, contracts, storeIds, orders })

        if (sessionData) {
          this.saveSessionToLocalStorage(sessionData)
          this.setState({
            username: sessionData.username,
            password: sessionData.password,
            isAdmin: sessionData.isAdmin,
            isLogged: sessionData.isLogged
          })
        }

      }))

  }

  refreshResources = () => {
    this.loadResourcesFromMongo()
  }

  loadOrders = () => {
    const getOrders = () => { return axios.get('/orders/id/--all--') }

    axios.all([getOrders()])
      .then(axios.spread((orders) => {

        orders = orders.data

        const areThereErrors = (resource) => {
          if (resource.error) {
            console.log(resource.error)
            return true
          }
          else{
            return false
          }
        }

        if (areThereErrors(orders)) return this.props.cleaningLoginSession()

        this.setState({ orders })
      }))
  }

  refreshOrders = () => {
    // console.log('orders: ' + this.state.orders.length)
    this.loadOrders()
  }

  handleUsername = (e) => {
    this.setState({ username: e.target.value })
  }

  handlePassword = (e) => {
    this.setState({ password: e.target.value })
  }

  saveSessionToLocalStorage = (data) => {
    window.localStorage.setItem('token', data.token)
    window.localStorage.setItem('username', data.username)
    window.localStorage.setItem('isAdmin', data.isAdmin.toString())
  }

  cleanSessionToLocalStorage = () => {
    window.localStorage.setItem('token', '')
    window.localStorage.setItem('username', '')
    window.localStorage.setItem('isAdmin', '')
  }

  // Clean and close the login session
  // ----------------------------------
  cleaningLoginSession = () => {
    this.cleanSessionToLocalStorage()
    this.setState({
      username: '',
      password: '',
      isAdmin: false,
      isLogged: false
    })
  }

  handleClickLoginButton = () => {
    let bodyLogin = {
      username: this.state.username,
      pwd: this.state.password
    }

    axios.post('/login', bodyLogin)
      .then((response) => {
        if (response.data.error) {
          this.setState({
            loginStatus: {error: true, message: response.data.error}
          })
          setTimeout(() => {
            this.setState({loginStatus: {error: false, message: ''}})
            this.cleaningLoginSession()
          }, 2000)
        }
        else if (response.data.ok) {
          // OK (we get token!)

          if (this.state.username !== response.data.username) {
            console.log(`Error: username's incongruentes: ${this.state.username} !== ${response.data.username}`)
            this.cleaningLoginSession()
          }
          else {

            // Creating new login session
            // ---------------------------
            let sessionData = {
              token: response.data.token,
              username: response.data.username,
              password: '',
              isAdmin: response.data.isAdmin,
              isLogged: true
            }

            // Setting token in HTTP headers
            // ------------------------------
            axios.defaults.headers.common['Authorization'] = sessionData.token

            // Load resources from Mongo and set new login session data
            // ---------------------------------------------------------
            this.loadResourcesFromMongo(sessionData)
          }

        }
        else {
          console.log('Error desconocido!')
          this.cleaningLoginSession()
        }
      })
      .catch((error) => {
        console.log(error)
        this.cleaningLoginSession()
      })

  }

  handleLoginMenuOpen = (event) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleLoginMenuClose = () => {
    this.setState({ anchorEl: null })
  }

  handleLoginDisconnect = () => {
    this.setState({ anchorEl: null })
    this.cleaningLoginSession()
  }

  showLoggedUsername = () => {
    if (this.state.isLogged) {
      return (
        <div>
          <Button
            color="inherit"
            aria-owns={this.state.anchorEl ? 'simple-menu' : undefined}
            aria-haspopup="true"
            onClick={this.handleLoginMenuOpen}
          >
            {this.state.username}&nbsp;&nbsp;
            <AccountCircleIcon />
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleLoginMenuClose}
          >
            <MenuItem onClick={this.handleLoginDisconnect}>Desconectar</MenuItem>
          </Menu>
        </div>
      )
    }
  }

  // Recovering old session...
  // --------------------------
  componentDidMount() {
    let token = window.localStorage.getItem('token')

    if (token) {
      axios.defaults.headers.common['Authorization'] = token
      this.loadResourcesFromMongo()
    }
    else {
      this.cleaningLoginSession()
    }
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h5" color="inherit" className={classes.grow}>
              Gestor de pedidos
            </Typography>
            {this.showLoggedUsername()}
          </Toolbar>
        </AppBar>
        {!this.state.isLogged &&
          <Login
            username={this.state.username}
            password={this.state.password}
            onHandleUsername={this.handleUsername}
            onHandlePassword={this.handlePassword}
            onHandleClickLoginButton={this.handleClickLoginButton}
            loginStatus={this.state.loginStatus}
          />}
        {this.state.isLogged && this.state.isAdmin &&
          <ContainerForAdminUser
            hotels={this.state.hotels}
            providers={this.state.providers}
            items={this.state.items}
            contracts={this.state.contracts}
            storeIds={this.state.storeIds}
            onRefresh={this.refreshResources}
            orders={this.state.orders}
            onRefreshOrders={this.refreshOrders}
            cleaningLoginSession={this.cleaningLoginSession}
            isAdmin={this.state.isAdmin}
          />}
        {this.state.isLogged && !this.state.isAdmin &&
          <ContainerForHotelUser
            orders={this.state.orders}
            onRefreshOrders={this.refreshOrders}
            cleaningLoginSession={this.cleaningLoginSession}
            isAdmin={this.state.isAdmin}
          />}
      </div>
    )
  }
}

AppContainer.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(AppContainer)
