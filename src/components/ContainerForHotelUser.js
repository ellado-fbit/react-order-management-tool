import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import OrdersContainerWithPagination from './orders/_OrdersContainerWithPagination'

const styles = theme => ({
  root: {
    flexGrow: 1
  }
})

class ContainerForHotelUser extends React.Component {

  componentDidMount = () => {
    // Refresh setted by interval (to catch changes of 'status' in orders)
    // --------------------------------------------------------------------
    const self = this
    self.interval = setInterval(() => { this.props.onRefreshOrders() }, 60000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs value={0}>
            <Tab label="Pedidos" />
          </Tabs>
        </AppBar>
        <OrdersContainerWithPagination
          orders={this.props.orders}
          onRefreshOrders={this.props.onRefreshOrders}
          cleaningLoginSession={this.props.cleaningLoginSession}
          isAdmin={this.props.isAdmin}
        />
      </div>
    )
  }
}

ContainerForHotelUser.propTypes = {
  classes: PropTypes.object.isRequired,
  orders: PropTypes.array.isRequired,
  onRefreshOrders: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired
}

export default withStyles(styles)(ContainerForHotelUser)
