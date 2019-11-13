import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit / 4,
    minWidth: 700,
    maxWidth: 700
  }
})

class DialogDeliveryDates extends React.Component {

  showDeliveryDates = () => {
    if (!this.props.isAdmin) {
      if (this.props.order.delivery_dates === '') {
        return (
          <div>
            Fechas de entrega todavía no asignadas.
          </div>
        )
      } else {
        return (
          <div>
            {this.props.order.delivery_dates}
          </div>
        )
      }
    }
  }

  render() {
    const { classes } = this.props

    return (
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={this.props.isOpen}
        onClose={this.props.onClose}
      >
        <DialogTitle>{`${this.props.order.provider_name} [${this.props.order.store_name}]`}</DialogTitle>
        <DialogContent>
          {this.props.isAdmin && <FormControl className={classes.formControl}>
            <TextField
              id="delivery_dates"
              label="Fechas de entrega"
              multiline={true}
              value={this.props.deliveryDatesToUpdate}
              onChange={this.props.handleChangeDeliveryDates}
            />
          </FormControl>}
          {this.showDeliveryDates()}
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose}>
            Cerrar
          </Button>
          {this.props.isAdmin && <Button onClick={this.props.handleUpdateDeliveryDates} color="primary">
            Guardar&nbsp;&nbsp;
          </Button>}
        </DialogActions>
      </Dialog>
    )
  }
}

DialogDeliveryDates.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object.isRequired,
  deliveryDatesToUpdate: PropTypes.string.isRequired,
  handleChangeDeliveryDates: PropTypes.func.isRequired,
  handleUpdateDeliveryDates: PropTypes.func.isRequired
}

export default withStyles(styles, { withTheme: true })(DialogDeliveryDates)
