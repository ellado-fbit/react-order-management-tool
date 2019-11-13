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
import IconButton from '@material-ui/core/IconButton'
import CreateIcon from '@material-ui/icons/Create'
import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'
import DialogCreateUpdateContract from './DialogCreateUpdateContract'
import DialogRemove from './DialogRemove'
import deburr from 'lodash/deburr'
import isEqual from 'lodash/isEqual'
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
  fab: {
    margin: theme.spacing.unit,
    marginTop: '1%',
    marginLeft: '1%'
  }
})

class ContractsContainerWithPagination extends React.Component {
  state = {
    // page navigation
    page: 0,
    rowsPerPage: 5,
    filterText: '',

    // remove
    openDialogRemove: false,
    contractShownInDialogRemove: {},

    // create / update
    isNewContract: false,
    openDialogCreateUpdateContract: false,
    shownContract: {
      _id: '',
      provider_code: '',
      store_id: '',
      provider_name: '',
      store_name: '',
      item_codes: [],
      references: []
    },
    itemCodesInitialState: [],
    disableSaveButton: true,
    statusMessage: ''
  }

  // Handlers to open/close Dialog Remove
  // -------------------------------------
  handleOpenDialogRemove = (contract, e) => {
    this.setState({ contractShownInDialogRemove: contract, openDialogRemove: true })
  }
  handleCloseDialogRemove = () => {
    this.setState({ openDialogRemove: false })
  }

  // Handlers to open/close Dialog Create/Update Contract
  // -----------------------------------------------------
  handleOpenDialogCreateUpdateContract = (contract) => {
    if (contract === 'new') {
      this.setState({
        isNewContract: true,
        shownContract: {
          _id: '',
          provider_code: '',
          store_id: '',
          provider_name: '',
          store_name: '',
          item_codes: [],
          references: []
        },
        openDialogCreateUpdateContract: true,
        disableSaveButton: true,
        statusMessage: ''
      })
    } else {

      let newReferences = []
      contract.item_codes.forEach(x => newReferences.push(''))

      if (contract.references) newReferences = contract.references  // if references exist then takes current value

      this.setState({
        isNewContract: false,
        shownContract: {
          _id: contract._id,
          provider_code: contract.provider_code,
          store_id: contract.store_id,
          provider_name: contract.provider_name,
          store_name: contract.store_name,
          item_codes: contract.item_codes,
          references: newReferences
        },
        openDialogCreateUpdateContract: true,
        itemCodesInitialState: contract.item_codes,
        disableSaveButton: true,
        statusMessage: ''
      })
    }
  }
  handleCloseDialogCreateUpdateContract = () => {
    this.setState({ openDialogCreateUpdateContract: false })
    this.props.onRefresh()
  }

  handleChangeFilterText = (e) => {
    this.setState({ filterText: e.target.value })
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  filterRows = () => {
    return this.props.contracts.filter(contract => {
      return deburr(contract.sortable_name).includes(deburr(this.state.filterText).toLowerCase())
    }).sort((a, b) => (a.sortable_name < b.sortable_name ? -1 : 1))
  }

  onAddItemToList = (item_code) => {

    if (!this.state.shownContract.item_codes.find(x => x === item_code)) {

      let newList = JSON.parse(JSON.stringify(this.state.shownContract.item_codes))
      newList.push(item_code)  // IMPORTANT: No hacer nunca this.state.xxx.push(...) porque variamos el estado, hacer copia primero.

      let newReferences = JSON.parse(JSON.stringify(this.state.shownContract.references))
      newReferences.push('')  // IMPORTANT: No hacer nunca this.state.xxx.push(...) porque variamos el estado, hacer copia primero.

      // Save button status
      // -------------------
      let newSaveButtonStatus = true

      if (this.state.isNewContract) {  // Create Contract
        if (this.state.shownContract.provider_code !== '' &&
            this.state.shownContract.store_id !== '' &&
            newList.length > 0
            ) {
          newSaveButtonStatus = false
        }
      } else {  // Update Contract
        let initialList = JSON.parse(JSON.stringify(this.state.itemCodesInitialState))
        let updatedList = JSON.parse(JSON.stringify(newList))

        if ( !isEqual(initialList.sort(), updatedList.sort()) ) newSaveButtonStatus = false
      }

      this.setState({
        shownContract: {
          _id: this.state.shownContract._id,
          provider_code: this.state.shownContract.provider_code,
          store_id: this.state.shownContract.store_id,
          provider_name: this.state.shownContract.provider_name,
          store_name: this.state.shownContract.store_name,
          item_codes: newList,
          references: newReferences
        },
        disableSaveButton: newSaveButtonStatus,
        statusMessage: ''
      })

    } else {
      alert('El artículo ya está en la lista!')
    }
  }

  onRemoveItemFromList = (codigo_articulo) => {

    // First, remove the reference of the selected item to remove
    let newReferences = JSON.parse(JSON.stringify(this.state.shownContract.references))

    this.state.shownContract.item_codes.forEach((x, index) => {
      if (x === codigo_articulo) newReferences.splice(index, 1)
    })

    let newList = JSON.parse(JSON.stringify(this.state.shownContract.item_codes))
    newList = newList.filter(x => x !== codigo_articulo)

    // Save button status
    // -------------------
    let newSaveButtonStatus = true

    if (this.state.isNewContract) {  // Create Contract
      if (this.state.shownContract.provider_code !== '' &&
          this.state.shownContract.store_id !== '' &&
          newList.length > 0
          ) {
        newSaveButtonStatus = false
      }
    } else {  // Update Contract
      let initialList = JSON.parse(JSON.stringify(this.state.itemCodesInitialState))
      let updatedList = JSON.parse(JSON.stringify(newList))

      if ( !isEqual(initialList.sort(), updatedList.sort()) && updatedList.length > 0 ) newSaveButtonStatus = false
    }

    this.setState({
      shownContract: {
        _id: this.state.shownContract._id,
        provider_code: this.state.shownContract.provider_code,
        store_id: this.state.shownContract.store_id,
        provider_name: this.state.shownContract.provider_name,
        store_name: this.state.shownContract.store_name,
        item_codes: newList,
        references: newReferences
      },
      disableSaveButton: newSaveButtonStatus,
      statusMessage: ''
    })
  }

  onHandleFormProviderCode = (e) => {

    // Save button status
    // -------------------
    let newSaveButtonStatus = true

    if (this.state.shownContract.store_id !== '' &&
        this.state.shownContract.item_codes.length > 0
        ) {
      newSaveButtonStatus = false
    }

    this.setState({
      shownContract: {
        _id: this.state.shownContract._id,
        provider_code: e.target.value,
        store_id: this.state.shownContract.store_id,
        provider_name: this.state.shownContract.provider_name,
        store_name: this.state.shownContract.store_name,
        item_codes: this.state.shownContract.item_codes,
        references: this.state.shownContract.references
      },
      disableSaveButton: newSaveButtonStatus,
      statusMessage: ''
    })
  }

  onHandleFormStoreId = (e) => {

    // Save button status
    // -------------------
    let newSaveButtonStatus = true

    if (this.state.shownContract.provider_code !== '' &&
        this.state.shownContract.item_codes.length > 0
        ) {
      newSaveButtonStatus = false
    }

    this.setState({
      shownContract: {
        _id: this.state.shownContract._id,
        provider_code: this.state.shownContract.provider_code,
        store_id: e.target.value,
        provider_name: this.state.shownContract.provider_name,
        store_name: this.state.shownContract.store_name,
        item_codes: this.state.shownContract.item_codes,
        references: this.state.shownContract.references
      },
      disableSaveButton: newSaveButtonStatus,
      statusMessage: ''
    })
  }

  onClickSaveButton = () => {

    if (this.state.isNewContract) {  // Create Contract (POST)

      let existentContract = this.props.contracts.find(x => {
        return (x.provider_code === this.state.shownContract.provider_code && x.store_id === this.state.shownContract.store_id)
      })

      if (existentContract) {

        alert('Error: Ya existe un contracto con los mismos valores de proveedor y almacén.')
        return false

      } else {

        // Get provider_name to calculate sortable_name
        // ---------------------------------------------
        let provider_name = this.props.providers.find(x => { return x.code === this.state.shownContract.provider_code }).name

        // Creating new order
        // -------------------
        let myContract = {
          provider_code: this.state.shownContract.provider_code,
          item_codes: this.state.shownContract.item_codes,
          store_id: this.state.shownContract.store_id,
          sortable_name: `${provider_name.toLowerCase()} - ${this.state.shownContract.store_id}`,
          references: this.state.shownContract.references
        }

        axios.post(`/contracts/`, myContract)
          .then((response) => {
            if (response.data.error) {
              if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
                return this.props.cleaningLoginSession()
              }
              console.log(response.data.error)
              this.setState({
                statusMessage: 'Error: No se pudo crear el contrato. Ver detalles en consola.',
                disableSaveButton: true
              })
              this.props.onRefresh()
            }
            else {
              // OK
              this.setState({ openDialogCreateUpdateContract: false })
              this.props.onRefresh()
            }
          })
          .catch((error) => {
            console.log(JSON.stringify(error))
            this.setState({
              statusMessage: 'Error: No se pudo crear el contrato. Ver detalles en consola.',
              disableSaveButton: true
            })
          })
      }

    } else {  // Update Contract (PUT)
      // console.log('Update items...')

      // Update contract items
      // ----------------------
      let myContract = {
        item_codes: this.state.shownContract.item_codes,
        references: this.state.shownContract.references
      }

      axios.put(`/contracts/id/${this.state.shownContract._id}`, myContract)
        .then((response) => {
          if (response.data.error) {
            if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
              return this.props.cleaningLoginSession()
            }
            console.log(response.data.error)
            this.setState({
              statusMessage: 'Error: No se pudo modificar el contrato. Ver detalles en consola.',
              disableSaveButton: true
            })
            this.props.onRefresh()
          }
          else {
            // OK
            this.setState({ openDialogCreateUpdateContract: false })
            this.props.onRefresh()
          }
        })
        .catch((error) => {
          console.log(JSON.stringify(error))
          this.setState({
            statusMessage: 'Error: No se pudo crear el contrato. Ver detalles en consola.',
            disableSaveButton: true
          })
        })

    }
  }

  onChangeReference = (index, e) => {
    let newReferences = JSON.parse(JSON.stringify(this.state.shownContract.references))

    newReferences[index] = e.target.value

    this.setState({
      shownContract: {
        _id: this.state.shownContract._id,
        provider_code: this.state.shownContract.provider_code,
        store_id: this.state.shownContract.store_id,
        provider_name: this.state.shownContract.provider_name,
        store_name: this.state.shownContract.store_name,
        item_codes: this.state.shownContract.item_codes,
        references: newReferences
      },
      disableSaveButton: false,
      statusMessage: ''
    })
  }

  render() {
    const { classes } = this.props
    const { rowsPerPage, page } = this.state
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.filterRows().length - page * rowsPerPage)

    return (
      <div>
        <Fab color="primary" size="small" aria-label="Add" onClick={() => this.handleOpenDialogCreateUpdateContract('new')} className={classes.fab}>
          <AddIcon />
        </Fab>
        <DialogRemove
          isOpen={this.state.openDialogRemove}
          onClose={this.handleCloseDialogRemove}
          register={this.state.contractShownInDialogRemove}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <DialogCreateUpdateContract
          isOpen={this.state.openDialogCreateUpdateContract}
          onClose={this.handleCloseDialogCreateUpdateContract}
          providers={this.props.providers}
          storeIds={this.props.storeIds}
          items={this.props.items}
          isNewContract={this.state.isNewContract}
          shownContract={this.state.shownContract}
          onClickSaveButton={this.onClickSaveButton}
          disableSaveButton={this.state.disableSaveButton}
          onAddItemToList={this.onAddItemToList}
          onRemoveItemFromList={this.onRemoveItemFromList}
          onHandleFormProviderCode={this.onHandleFormProviderCode}
          onHandleFormStoreId={this.onHandleFormStoreId}
          statusMessage={this.state.statusMessage}
          onChangeReference={this.onChangeReference}
        />
        <FormControl className={classes.formControl}>
          <TextField
            label="Filtrar contratos por proveedor o almacén"
            value={this.state.filterText}
            onChange={this.handleChangeFilterText}
          />
        </FormControl>
        <Paper className={classes.root}>
          <div className={classes.tableWrapper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <CustomTableCell align="left">Proveedor</CustomTableCell>
                  <CustomTableCell align="left">Almacén</CustomTableCell>
                  <CustomTableCell align="left">Número<br />artículos</CustomTableCell>
                  <CustomTableCell align="left">Modificar<br />artículos</CustomTableCell>
                  <CustomTableCell align="left">Eliminar</CustomTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.filterRows().slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index + 1}>
                    <TableCell align="left">{row.provider_name}</TableCell>
                    <TableCell align="left">{row.store_name}</TableCell>
                    <TableCell align="left">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{row.item_codes.length}</TableCell>
                    <TableCell align="left">
                      <IconButton variant="contained" onClick={() => this.handleOpenDialogCreateUpdateContract(row)}>
                        &nbsp;<CreateIcon />
                      </IconButton>
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
                    <TableCell colSpan={5} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[rowsPerPage]}
                    colSpan={5}
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
  providers: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  contracts: PropTypes.array.isRequired,
  storeIds: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles)(ContractsContainerWithPagination)
