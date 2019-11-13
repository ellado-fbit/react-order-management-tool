import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import SaveIcon from '@material-ui/icons/Save'
import Slide from '@material-ui/core/Slide'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'

const CustomTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#dfdfdf',
    color: theme.palette.common.black,
    fontSize: 14,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell)

const styles = (theme) => ({
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    }
  },
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1
  },
  grow: {
    width: '85%',
    marginTop: theme.spacing.unit * 2,
    marginLeft: '7%'
  },
  table: {
    minWidth: '100%',
  }
})

function Transition(props) {
  return <Slide direction="up" {...props} />
}

class DialogFillOrderQuantities extends React.Component {

  handleUpdateFormQty = (updateQty, e) => {
    this.props.onUpdateFormQty(updateQty, e.target.value)
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Dialog
          fullScreen
          open={this.props.isOpen}
          onClose={this.props.onClose}
          TransitionComponent={Transition}
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <Button color="inherit" onClick={this.props.onClose}>
                <CloseIcon />
                &nbsp;&nbsp;Cerrar
              </Button>
              &nbsp;&nbsp;&nbsp;
              <Button color="inherit" onClick={this.props.onSaveButtonQuantities} disabled={this.props.disableSaveButtonQtys}>
                <SaveIcon />
                &nbsp;&nbsp;Guardar
              </Button>
            </Toolbar>
          </AppBar>
          <Typography variant="h5" className={classes.grow}>
            {this.props.order.provider_name}&nbsp;[{this.props.order.store_name}]
          </Typography>

          <div className={classes.grow}>
            <Typography variant="h6">
              {this.props.order.hotel_name}
            </Typography>

            <Table padding={'dense'}>
              <TableHead>
                <TableRow>
                  <CustomTableCell align="left">Artículo</CustomTableCell>
                  <CustomTableCell align="left">Cantidad</CustomTableCell>
                  <CustomTableCell align="left">Formato</CustomTableCell>
                  <CustomTableCell align="left">Referencia</CustomTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.order.item_codes.map((item_code, index) => (
                  <TableRow className={classes.row} key={index + 1}>
                    <CustomTableCell align="left">{`${this.props.order.item_names[index]} [${item_code}]`}</CustomTableCell>
                    <CustomTableCell align="left">
                      <TextField
                        label="Rellenar..."
                        value={this.props.order.qtys[index]}
                        onChange={(e) => this.handleUpdateFormQty({
                          item_code: item_code
                        }, e)}
                      />
                    </CustomTableCell>
                    <CustomTableCell align="left">{this.props.order.item_formats[index]}</CustomTableCell>
                    <CustomTableCell align="left">{this.props.order.references ? this.props.order.references[index] : ''}</CustomTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <br /><br />
          </div>

          <br /><br />
        </Dialog>
      </div>
    )
  }
}

DialogFillOrderQuantities.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object.isRequired,
  onUpdateFormQty: PropTypes.func,
  onSaveButtonQuantities: PropTypes.func,
  disableSaveButtonQtys: PropTypes.bool
}

export default withStyles(styles)(DialogFillOrderQuantities)
