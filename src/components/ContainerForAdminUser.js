import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ProvidersContainer from './providers/ProvidersContainer'
import ItemsContainerWithPagination from './items/ItemsContainerWithPagination'
import HotelsContainer from './hotels/HotelsContainer'
import ContractsContainerWithPagination from './contracts/ContractsContainerWithPagination'
import OrdersContainerWithPagination from './orders/_OrdersContainerWithPagination'

const styles = theme => ({
  root: {
    flexGrow: 1
  }
})

class ContainerForAdminUser extends React.Component {
  state = {
    activeTab: 4
  }

  componentDidMount = () => {
    // Refresh setted by interval (to catch new orders created by hotels)
    // -------------------------------------------------------------------
    const self = this
    self.interval = setInterval(() => { this.props.onRefreshOrders() }, 60000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  handleChange = (event, value) => {
    this.setState({ activeTab: value })
  }

  selectTab = () => {
    if (this.state.activeTab === 0) {
      return (
        <HotelsContainer
          hotels={this.props.hotels}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
      )
    }
    else if (this.state.activeTab === 1) {
      return (
        <ProvidersContainer
          providers={this.props.providers}
          contracts={this.props.contracts}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
      )
    }
    else if (this.state.activeTab === 2) {
      return (
        <ItemsContainerWithPagination
          items={this.props.items}
          contracts={this.props.contracts}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
      )
    }
    else if (this.state.activeTab === 3) {
      return (
        <ContractsContainerWithPagination
          providers={this.props.providers}
          items={this.props.items}
          contracts={this.props.contracts}
          storeIds={this.props.storeIds}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
      )
    }
    else if (this.state.activeTab === 4) {
      return (
        <OrdersContainerWithPagination
          orders={this.props.orders}
          onRefreshOrders={this.props.onRefreshOrders}
          cleaningLoginSession={this.props.cleaningLoginSession}
          isAdmin={this.props.isAdmin}
        />
      )
    }
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs value={this.state.activeTab} onChange={this.handleChange}>
            <Tab label="Hoteles" />
            <Tab label="Proveedores" />
            <Tab label="Artículos" />
            <Tab label="Contratos" />
            <Tab label="Pedidos" />
          </Tabs>
        </AppBar>
        {this.selectTab()}
      </div>
    )
  }
}

ContainerForAdminUser.propTypes = {
  classes: PropTypes.object.isRequired,
  hotels: PropTypes.array.isRequired,
  providers: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  contracts: PropTypes.array.isRequired,
  storeIds: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
  orders: PropTypes.array.isRequired,
  onRefreshOrders: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired
}

export default withStyles(styles)(ContainerForAdminUser)
