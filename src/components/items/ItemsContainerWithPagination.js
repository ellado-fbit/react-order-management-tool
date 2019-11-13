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
import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import DialogCreate from './DialogCreate'
import ClearIcon from '@material-ui/icons/Clear'
import DialogRemove from './DialogRemove'
import CreateIcon from '@material-ui/icons/Create'
import DialogUpdateItem from './DialogUpdateItem'
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
  fab: {
    margin: theme.spacing.unit,
    marginTop: '1%',
    marginLeft: '1%'
  }
})

class ItemsContainerWithPagination extends React.Component {
  state = {
    // pagination
    page: 0,
    rowsPerPage: 5,
    filterText: '',

    // create item
    openDialogCreate: false,

    // remove item
    openDialogRemove: false,
    registerShownInDialogRemove: {},

    // update item
    openDialogUpdateItem: false,
    itemIdToUpdate: '',
    itemNameToUpdate: '',
    itemFormatToUpdate: ''
  }

  // Handlers to open/close Dialog Create
  // -------------------------------------
  handleOpenDialogCreate = () => {
    this.setState({ openDialogCreate: true })
  }
  handleCloseDialogCreate = () => {
    this.setState({ openDialogCreate: false })
  }

  // Handlers to open/close Dialog Remove
  // -------------------------------------
  handleOpenDialogRemove = (register, e) => {
    this.setState({ registerShownInDialogRemove: register, openDialogRemove: true })
  }
  handleCloseDialogRemove = () => {
    this.setState({ openDialogRemove: false })
  }

  // Handlers to open/close Dialog Update Item
  // ------------------------------------------
  handleOpenDialogUpdateItem = (register, e) => {
    this.setState({
      itemIdToUpdate: register._id,
      itemNameToUpdate: register.name,
      itemFormatToUpdate: register.format,
      openDialogUpdateItem: true
    })
  }
  handleCloseDialogUpdateItem = () => {
    this.setState({ openDialogUpdateItem: false })
  }

  handleChangeName = (changedName) => {
    this.setState({ itemNameToUpdate: changedName })
  }

  handleChangeFormat = (changedFormat) => {
    this.setState({ itemFormatToUpdate: changedFormat })
  }

  handleUpdate = () => {
    // console.log(`name: ${this.state.itemNameToUpdate}, format: ${this.state.itemFormatToUpdate}`)

    let fieldsToUpdate = {
      name: this.state.itemNameToUpdate.trim(),
      format: this.state.itemFormatToUpdate.trim()
    }

    axios.put(`/items/id/${this.state.itemIdToUpdate}`, fieldsToUpdate)
      .then((response) => {
        if (response.data.error) {
          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          }
          console.log(response.data.error)
        }

        // OK
        this.props.onRefresh()
        this.setState({ openDialogUpdateItem: false })

      })
      .catch((error) => {
        console.log(JSON.stringify(error))
      })

  }

  handleChangeFilterText = (e) => {
    this.setState({ filterText: e.target.value })
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  filterRows = () => {
    return this.props.items.filter(item => {
      let sortable_name = deburr(`${item.name} [${item.code}]`).toLowerCase()
      return sortable_name.includes(deburr(this.state.filterText).toLowerCase())
    }).sort((a, b) => (deburr(`${a.name} [${a.code}]`).toLowerCase() < deburr(`${b.name} [${b.code}]`).toLowerCase() ? -1 : 1))
  }

  render() {
    const { classes } = this.props
    const { rowsPerPage, page } = this.state
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.filterRows().length - page * rowsPerPage)

    return (
      <div>
        <Fab color="primary" size="small" aria-label="Add" onClick={this.handleOpenDialogCreate} className={classes.fab}>
          <AddIcon />
        </Fab>
        <DialogCreate
          isOpen={this.state.openDialogCreate}
          onClose={this.handleCloseDialogCreate}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <DialogRemove
          isOpen={this.state.openDialogRemove}
          onClose={this.handleCloseDialogRemove}
          register={this.state.registerShownInDialogRemove}
          contracts={this.props.contracts}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <DialogUpdateItem
          isOpen={this.state.openDialogUpdateItem}
          onClose={this.handleCloseDialogUpdateItem}
          itemNameToUpdate={this.state.itemNameToUpdate}
          itemFormatToUpdate={this.state.itemFormatToUpdate}
          onChangeName={this.handleChangeName}
          onChangeFormat={this.handleChangeFormat}
          onHandleUpdate={this.handleUpdate}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <FormControl className={classes.formControl}>
          <TextField
            label="Filtrar artículos por nombre o código"
            value={this.state.filterText}
            onChange={this.handleChangeFilterText}
          />
        </FormControl>
        <Paper className={classes.root}>
          <div className={classes.tableWrapper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <CustomTableCell align="left">Código</CustomTableCell>
                  <CustomTableCell align="left">Nombre</CustomTableCell>
                  <CustomTableCell align="left">Formato</CustomTableCell>
                  <CustomTableCell align="left">Modificar</CustomTableCell>
                  <CustomTableCell align="left">Eliminar</CustomTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.filterRows().slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index + 1}>
                    <TableCell align="left">{row.code}</TableCell>
                    <TableCell align="left">{row.name}</TableCell>
                    <TableCell align="left">{row.format}</TableCell>
                    <TableCell align="left">
                      <IconButton variant="contained" onClick={(e) => this.handleOpenDialogUpdateItem(row, e)}>
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

ItemsContainerWithPagination.propTypes = {
  classes: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  contracts: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles)(ItemsContainerWithPagination)
