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
import DialogCreate from './DialogCreate'
import IconButton from '@material-ui/core/IconButton'
import ClearIcon from '@material-ui/icons/Clear'
import DialogRemove from './DialogRemove'

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

class HotelsContainer extends React.Component {
  state = {
    openDialogCreate: false,
    openDialogRemove: false,
    registerShownInDialogRemove: {
      '_id': '',
      code: '',
      name: ''
    }
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

  render() {
    const { classes } = this.props

    return (
      <div>
        <Fab color="primary" size="small" aria-label="Add" onClick={this.handleOpenDialogCreate} className={classes.fab}>
          <AddIcon />
        </Fab>
        <DialogCreate
          isOpen={this.state.openDialogCreate}
          onClose={this.handleCloseDialogCreate}
          hotels={this.props.hotels}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <DialogRemove
          isOpen={this.state.openDialogRemove}
          onClose={this.handleCloseDialogRemove}
          register={this.state.registerShownInDialogRemove}
          onRefresh={this.props.onRefresh}
          cleaningLoginSession={this.props.cleaningLoginSession}
        />
        <Paper className={classes.root}>
          <Table padding={'dense'}>
            <TableHead>
              <TableRow>
                <CustomTableCell align="left">Código</CustomTableCell>
                <CustomTableCell align="left">Nombre del hotel</CustomTableCell>
                <CustomTableCell align="left">Nombre de usuario</CustomTableCell>
                <CustomTableCell align="left">Contraseña</CustomTableCell>
                <CustomTableCell align="left">Eliminar</CustomTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.hotels.map((row) => (
                <TableRow className={classes.row} key={row._id}>
                  <CustomTableCell align="left">{row.code}</CustomTableCell>
                  <CustomTableCell align="left">{row.name}</CustomTableCell>
                  <CustomTableCell align="left">{row.username}</CustomTableCell>
                  <CustomTableCell align="left">{row.pwd}</CustomTableCell>
                  <CustomTableCell align="left">
                    <IconButton variant="contained" onClick={(e) => this.handleOpenDialogRemove(row, e)} color="secondary">
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

HotelsContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  hotels: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles)(HotelsContainer)
