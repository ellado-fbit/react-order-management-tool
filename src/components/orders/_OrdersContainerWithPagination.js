import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableFooter from '@material-ui/core/TableFooter'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import CreateIcon from '@material-ui/icons/Create'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import SaveAltIcon from '@material-ui/icons/SaveAlt'
import Link from '@material-ui/core/Link'
import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import ClearIcon from '@material-ui/icons/Clear'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import DoneIcon from '@material-ui/icons/Done'
import RemoveCircleIcon from '@material-ui/icons/RemoveCircleOutline'
import DialogCreate from './DialogCreate'
import DialogRemove from './DialogRemove'
import DialogStatus from './DialogStatus'
import DialogFillOrderQuantities from './DialogFillOrderQuantities'
import DialogDeliveryDates from './DialogDeliveryDates'
import deburr from 'lodash/deburr'
import axios from 'axios'

const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
})

// Bottom action buttons to change the page
// -----------------------------------------
class TablePaginationActions extends React.Component {
  handleFirstPageButtonClick = event => {
    this.props.onChangePage(event, 0)
  }

  handleBackButtonClick = event => {
    this.props.onChangePage(event, this.props.page - 1)
  }

  handleNextButtonClick = event => {
    this.props.onChangePage(event, this.props.page + 1)
  }

  handleLastPageButtonClick = event => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1),
    )
  }

  render() {
    const { classes, count, page, rowsPerPage, theme } = this.props

    return (
      <div className={classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Next Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Last Page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    )
  }
}

TablePaginationActions.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
}

const TablePaginationActionsWrapped = withStyles(actionsStyles, { withTheme: true })(
  TablePaginationActions,
)

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: '#cecece',
    color: theme.palette.common.black,
    fontSize: 14,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell)

const styles = theme => ({
  root: {
    width: '98%',
    marginTop: theme.spacing.unit,
    marginLeft: '1%',
    marginRight: '1%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  formControl: {
    width: '98%',
    marginLeft: '1%',
    marginRight: '1%',
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: '2%',
    marginLeft: '1%'
  },
  statusColorOpenOrder: {
    backgroundColor: 'lightGreen',
    color: '#202020',
    fontSize: 12
  },
  statusColorValidatedOrder: {
    backgroundColor: '#ffb74d',
    color: '#202020',
    fontSize: 12
  },
  statusColorClosedOrder: {
    backgroundColor: '#ef9a9a',
    color: '#202020',
    fontSize: 12
  }
})

class ContractsContainerWithPagination extends React.Component {
  state = {
    // pagination
    page: 0,
    rowsPerPage: 5,
    filterText: '',

    // create order
    openDialogCreate: false,
    preorders: [],

    // remove order
    openDialogRemove: false,
    orderShownInDialogRemove: {},

    // status order
    openDialogStatus: false,
    orderShownInDialogStatus: {},
    statusToUpdate: '',

    // update qty's
    openDialogFillOrderQuantities: false,
    orderShownInDialogFillOrderQuantities: {
      item_names: [],
      item_codes: [],
      item_formats: [],
      qtys: [],
      provider_name: '',
      store_name: '',
      hotel_name: ''
    },
    disableSaveButtonQtys: true,

    // delivery dates
    openDialogDeliveryDates: false,
    orderShownInDialogDeliveryDates: {},
    deliveryDatesToUpdate: ''
  }

  // Handlers to open/close Dialog Create
  // -------------------------------------
  handleOpenDialogCreate = () => {

    axios.get(`/preorders/generate_preorders`)
      .then((response) => {
        if (response.data.error) {
          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          } else {
            console.log(response.data.error)
          }
        }
        else {
          // OK
          this.setState({
            preorders: response.data,
            openDialogCreate: true
          })
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
      })

  }

  handleCloseDialogCreate = () => {
    this.setState({ openDialogCreate: false })
  }

  // Handlers to open/close Dialog Remove
  // -------------------------------------
  handleOpenDialogRemove = (order, e) => {
    this.setState({ orderShownInDialogRemove: order, openDialogRemove: true })
  }
  handleCloseDialogRemove = () => {
    this.setState({ openDialogRemove: false })
  }

  handleChangeFilterText = (e) => {
    this.setState({ filterText: e.target.value })
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  filterRows = () => {
    return this.props.orders.filter(order => {
      return deburr(`${order.sortable_name} ${order.status}`).includes(deburr(this.state.filterText).toLowerCase())
    }).sort((a, b) => (`${a.creation_date}` < `${b.creation_date}` ? 1 : -1))
  }

  showRowStatus = (row) => {
    let statusClass = 'statusColorOpenOrder'
    if (row.status === 'validado') statusClass = 'statusColorValidatedOrder'
    if (row.status === 'cerrado') statusClass = 'statusColorClosedOrder'

    if (this.props.isAdmin) {
      return (
        <Button variant="outlined" size={'small'} onClick={(e) => this.handleOpenDialogStatus(row, e)} className={this.props.classes[statusClass]}>
          &nbsp;{row.status}&nbsp;
          {row.status === 'abierto' && <ChevronRightIcon />}
          {row.status === 'validado' && <DoneIcon />}
          {row.status === 'cerrado' && <RemoveCircleIcon />}
        </Button>
      )
    }
    else {
      return (
        <Button variant="outlined" size={'small'} onClick={(e) => { return false }} className={this.props.classes[statusClass]}>
          &nbsp;{row.status}&nbsp;
          {row.status === 'abierto' && <ChevronRightIcon />}
          {row.status === 'validado' && <DoneIcon />}
          {row.status === 'cerrado' && <RemoveCircleIcon />}
        </Button>
      )
    }
  }

  // Handlers to open/close Dialog Status
  // -------------------------------------
  handleOpenDialogStatus = (order, e) => {
    this.setState({
      orderShownInDialogStatus: order,
      statusToUpdate: order.status,
      openDialogStatus: true
    })
  }
  handleCloseDialogStatus = () => {
    this.setState({ openDialogStatus: false })
  }

  handleChangeStatus = (e) => {
    this.setState({ statusToUpdate: e.target.value })
  }

  handleUpdateStatus = () => {
    let updateStatus = {
      status: this.state.statusToUpdate
    }

    axios.put(`/orders/id/${this.state.orderShownInDialogStatus._id}`, updateStatus)
      .then((response) => {
        if (response.data.error) {
          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          }
          console.log(response.data.error)
        }

        this.props.onRefreshOrders()
        this.setState({ openDialogStatus: false })

      })
      .catch((error) => {
        console.log(JSON.stringify(error))
      })
  }

  // Handlers to open/close Dialog Fill Order Quantities
  // ----------------------------------------------------
  handleOpenDialogFillOrderQuantities = (order, e) => {
    this.setState({
      orderShownInDialogFillOrderQuantities: order,
      disableSaveButtonQtys: true,
      openDialogFillOrderQuantities: true
    })
  }

  handleCloseDialogFillOrderQuantities = () => {
    if (!this.state.disableSaveButtonQtys) {
      let confirmed = window.confirm('ATENCIÓN: Ha realizado cambios sin guardar. Pulse Aceptar si quiere cerrar SIN GUARDAR los cambios.')
      if (confirmed) {
        this.props.onRefreshOrders()
        this.setState({ openDialogFillOrderQuantities: false })
      }
    } else {
      this.props.onRefreshOrders()
      this.setState({ openDialogFillOrderQuantities: false })
    }
  }

  handleUpdateFormQty = (updateQty, value) => {
    if (/^(\d+),?(\d*)$/.test(value) || value === '') {

      let updatedOrder = this.state.orderShownInDialogFillOrderQuantities

      this.state.orderShownInDialogFillOrderQuantities.item_codes.forEach((item_code, index) => {
        if (item_code === updateQty.item_code) {
          updatedOrder.qtys[index] = value
        }
      })

      this.setState({
        orderShownInDialogFillOrderQuantities: updatedOrder,
        disableSaveButtonQtys: false
      })

    } else {
      alert('ATENCIÓN: Sólo se aceptan dígitos numéricos.')
      return false
    }
  }

  handleSaveButtonQuantities = () => {
    // console.log(JSON.stringify(this.state.orderShownInDialogFillOrderQuantities, null, 2))

    let currentId = this.state.orderShownInDialogFillOrderQuantities._id
    let updatedQtys = {
      qtys: this.state.orderShownInDialogFillOrderQuantities.qtys,
      hotel_username: this.state.orderShownInDialogFillOrderQuantities.hotel_username
    }

    updatedQtys.qtys = updatedQtys.qtys.map(x => {
      if (/^(\d+),$/.test(x)) {
        return `${x}0`
      } else {
        return x
      }
    })

    axios.put(`/orders/id/${currentId}`, updatedQtys)
      .then((response) => {
        if (response.data.error) {
          console.log(response.data.error)

          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          }

          if (response.data.error === 'ORDER_NOT_EXIST') {
            alert('Error: El pedido ha sido eliminado por el administrador.')
            this.props.onRefreshOrders()
            this.setState({
              openDialogFillOrderQuantities: false,
              orderShownInDialogFillOrderQuantities: {
                item_names: [],
                item_codes: [],
                item_formats: [],
                qtys: [],
                provider_name: '',
                store_name: '',
                hotel_name: ''
              },
              disableSaveButtonQtys: true
            })
          }

        }
        else {
          // OK

          // Disable 'Save' button until detected new changes on text forms
          // ---------------------------------------------------------------
          this.setState({ disableSaveButtonQtys: true })
          this.props.onRefreshOrders()
        }
      })
      .catch((error) => {
        console.log(JSON.stringify(error))
      })

  }

  // Handlers to open/close Dialog Delivery Dates
  // ---------------------------------------------
  handleOpenDialogDeliveryDates = (order, e) => {
    this.setState({
      orderShownInDialogDeliveryDates: order,
      deliveryDatesToUpdate: order.delivery_dates,
      openDialogDeliveryDates: true
    })
  }
  handleCloseDialogDeliveryDates = () => {
    this.setState({ openDialogDeliveryDates: false })
  }

  handleChangeDeliveryDates = (e) => {
    this.setState({ deliveryDatesToUpdate: e.target.value })
  }

  handleUpdateDeliveryDates = () => {
    let updateDeliveryDates = {
      delivery_dates: this.state.deliveryDatesToUpdate,
      hotel_username: this.state.orderShownInDialogDeliveryDates.hotel_username
    }

    axios.put(`/orders/id/${this.state.orderShownInDialogDeliveryDates._id}`, updateDeliveryDates)
      .then((response) => {
        if (response.data.error) {
          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          }
          console.log(response.data.error)
        }

        // OK
        this.props.onRefreshOrders()
        this.setState({ openDialogDeliveryDates: false })

      })
      .catch((error) => {
        console.log(JSON.stringify(error))
      })
  }

  render() {
    const { classes } = this.props
    const { rowsPerPage, page } = this.state
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.filterRows().length - page * rowsPerPage)

    return (
      <div>
        {!this.props.isAdmin &&
          <Button variant="contained" color="primary" onClick={this.handleOpenDialogCreate} className={classes.button}>
            Crear pedido&nbsp;&nbsp;
            <AddCircleIcon />
          </Button>}
        {this.props.isAdmin && <br />}
        <DialogCreate
          preorders={this.state.preorders}
          isOpen={this.state.openDialogCreate}
          onClose={this.handleCloseDialogCreate}
          onRefreshOrders={this.props.onRefreshOrders}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <DialogRemove
          isOpen={this.state.openDialogRemove}
          onClose={this.handleCloseDialogRemove}
          order={this.state.orderShownInDialogRemove}
          onRefreshOrders={this.props.onRefreshOrders}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <DialogStatus
          isOpen={this.state.openDialogStatus}
          onClose={this.handleCloseDialogStatus}
          order={this.state.orderShownInDialogStatus}
          statusToUpdate={this.state.statusToUpdate}
          handleChangeStatus={this.handleChangeStatus}
          handleUpdateStatus={this.handleUpdateStatus}
        />
        <DialogFillOrderQuantities
          isOpen={this.state.openDialogFillOrderQuantities}
          onClose={this.handleCloseDialogFillOrderQuantities}
          order={this.state.orderShownInDialogFillOrderQuantities}
          onUpdateFormQty={this.handleUpdateFormQty}
          onSaveButtonQuantities={this.handleSaveButtonQuantities}
          disableSaveButtonQtys={this.state.disableSaveButtonQtys}
        />
        <DialogDeliveryDates
          isAdmin={this.props.isAdmin}
          isOpen={this.state.openDialogDeliveryDates}
          onClose={this.handleCloseDialogDeliveryDates}
          order={this.state.orderShownInDialogDeliveryDates}
          deliveryDatesToUpdate={this.state.deliveryDatesToUpdate}
          handleChangeDeliveryDates={this.handleChangeDeliveryDates}
          handleUpdateDeliveryDates={this.handleUpdateDeliveryDates}
        />
        <FormControl className={classes.formControl}>
          {this.props.isAdmin && <TextField
            label="Filtrar pedidos por nombre de hotel, proveedor, almacén y estado de pedido."
            value={this.state.filterText}
            onChange={this.handleChangeFilterText}
          />}
          {!this.props.isAdmin && <TextField
            label="Filtrar pedidos por proveedor, almacén y estado de pedido."
            value={this.state.filterText}
            onChange={this.handleChangeFilterText}
          />}
        </FormControl>
        <Paper className={classes.root}>
          <div className={classes.tableWrapper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <CustomTableCell align="left">Hotel</CustomTableCell>
                  <CustomTableCell align="left">Proveedor</CustomTableCell>
                  <CustomTableCell align="left">Almacén</CustomTableCell>
                  <CustomTableCell align="left">Fecha de creación</CustomTableCell>
                  <CustomTableCell align="left">Estado pedido</CustomTableCell>
                  <CustomTableCell align="left">Rellenar<br />cantidades</CustomTableCell>
                  <CustomTableCell align="left">Rellenar<br />fechas<br />entrega</CustomTableCell>
                  <CustomTableCell align="left">Descargar<br />&nbsp;&nbsp;&nbsp;[Excel]</CustomTableCell>
                  <CustomTableCell align="left">Descargar<br />&nbsp;&nbsp;&nbsp;&nbsp;[PDF]</CustomTableCell>
                  <CustomTableCell align="left">Eliminar<br/>pedido</CustomTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.filterRows().slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index + 1}>
                    <TableCell align="left">{row.hotel_name}</TableCell>
                    <TableCell align="left">{row.provider_name}</TableCell>
                    <TableCell align="left">{row.store_name}</TableCell>
                    <TableCell align="left">{row.creation_date}</TableCell>
                    <TableCell align="left">{this.showRowStatus(row)}</TableCell>
                    <TableCell align="left">
                      {row.status === 'abierto' &&
                        <IconButton variant="contained" onClick={(e) => this.handleOpenDialogFillOrderQuantities(row, e)}>
                          <CreateIcon />
                        </IconButton>}
                      {row.status !== 'abierto' && <div>&nbsp;</div>}
                    </TableCell>
                    <TableCell align="left">
                      <IconButton variant="contained" onClick={(e) => this.handleOpenDialogDeliveryDates(row, e)}>
                        <CalendarTodayIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell align="left">
                      <Link underline={'none'} href={`${axios.defaults.baseURL}/orders_reports/format/csv/id/${row._id}?token=${axios.defaults.headers.common['Authorization']}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;<SaveAltIcon />
                      </Link>
                    </TableCell>
                    <TableCell align="left">
                      <Link underline={'none'} target={'_blank'} rel={'noopener'} href={`${axios.defaults.baseURL}/orders_reports/format/pdf/id/${row._id}?token=${axios.defaults.headers.common['Authorization']}`}>
                        &nbsp;&nbsp;&nbsp;&nbsp;<SaveAltIcon />
                      </Link>
                    </TableCell>
                    <TableCell align="left">
                      <IconButton variant="contained" onClick={(e) => this.handleOpenDialogRemove(row, e)} color="secondary">
                        <ClearIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 48 * emptyRows }}>
                    <TableCell colSpan={10} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[rowsPerPage]}
                    colSpan={10}
                    count={this.filterRows().length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      native: true,
                    }}
                    onChangePage={this.handleChangePage}
                    ActionsComponent={TablePaginationActionsWrapped}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </Paper>
      </div>
    )
  }
}

ContractsContainerWithPagination.propTypes = {
  classes: PropTypes.object.isRequired,
  orders: PropTypes.array.isRequired,
  onRefreshOrders: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired
}

export default withStyles(styles)(ContractsContainerWithPagination)
