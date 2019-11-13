import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import DialogCreateProvider from './DialogCreateProvider'
import IconButton from '@material-ui/core/IconButton'
import ClearIcon from '@material-ui/icons/Clear'
import DialogRemoveProvider from './DialogRemoveProvider'

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
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    }
  },
  fab: {
    margin: theme.spacing.unit,
    marginTop: '1%',
    marginLeft: '1%'
  }
})

class ProvidersContainer extends React.Component {
  state = {
    openDialogCreateProvider: false,
    openDialogRemoveProvider: false,
    providerShownInDialogRemoveProvider: {
      _id: '',
      code: '',
      name: ''
    }
  }

  // Handlers to open/close Dialog Create Provider
  // ----------------------------------------------
  handleOpenDialogCreateProvider = () => {
    this.setState({ openDialogCreateProvider: true })
  }
  handleCloseDialogCreateProvider = () => {
    this.setState({ openDialogCreateProvider: false })
  }

  // Handlers to open/close Dialog Remove Provider
  // ----------------------------------------------
  handleOpenDialogRemoveProvider = (provider, e) => {
    this.setState({ providerShownInDialogRemoveProvider: provider, openDialogRemoveProvider: true })
  }
  handleCloseDialogRemoveProvider = () => {
    this.setState({ openDialogRemoveProvider: false })
  }

  render() {
    const { classes } = this.props

    return (
      <div>
        <Fab color="primary" size="small" aria-label="Add" onClick={this.handleOpenDialogCreateProvider} className={classes.fab}>
          <AddIcon />
        </Fab>
        <DialogCreateProvider
          isOpen={this.state.openDialogCreateProvider}
          onClose={this.handleCloseDialogCreateProvider}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <DialogRemoveProvider
          isOpen={this.state.openDialogRemoveProvider}
          onClose={this.handleCloseDialogRemoveProvider}
          provider={this.state.providerShownInDialogRemoveProvider}
          contracts={this.props.contracts}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <Paper className={classes.root}>
          <Table padding={'dense'}>
            <TableHead>
              <TableRow>
                <CustomTableCell align="left">Código</CustomTableCell>
                <CustomTableCell align="left">Nombre</CustomTableCell>
                {/*<CustomTableCell align="left">Email</CustomTableCell>
                <CustomTableCell align="left">Teléfono</CustomTableCell>*/}
                <CustomTableCell align="left">Eliminar</CustomTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.providers.map((row) => (
                <TableRow className={classes.row} key={row._id}>
                  <CustomTableCell align="left">{row.code}</CustomTableCell>
                  <CustomTableCell align="left">{row.name}</CustomTableCell>
                  {/*<CustomTableCell align="left">{row.email}</CustomTableCell>
                  <CustomTableCell align="left">{row.phone}</CustomTableCell>*/}
                  <CustomTableCell align="left">
                    <IconButton variant="contained" onClick={(e) => this.handleOpenDialogRemoveProvider(row, e)} color="secondary">
                      <ClearIcon />
                    </IconButton>
                  </CustomTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <br /><br />
      </div>
    )
  }
}

ProvidersContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  providers: PropTypes.array.isRequired,
  contracts: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles)(ProvidersContainer)
