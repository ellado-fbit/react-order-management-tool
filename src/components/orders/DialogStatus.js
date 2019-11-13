import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControl from '@material-ui/core/FormControl'
// import MenuItem from '@material-ui/core/MenuItem'
// import Select from '@material-ui/core/Select'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit / 4,
    minWidth: 200,
    maxWidth: 200
  },
  colorAbierto: {
    color: 'green'
  },
  colorValidado: {
    color: '#ff9800'
  },
  colorCerrado: {
    color: '#ef5350'
  }
})

class DialogStatus extends React.Component {
  render() {
    const { classes } = this.props

    return (
      <Dialog
        open={this.props.isOpen}
        onClose={this.props.onClose}
      >
        <DialogTitle>Cambiar estado pedido</DialogTitle>
        <DialogContent>
          <FormControl className={classes.formControl}>
            <FormLabel component="legend">Seleccionar estado</FormLabel>
            <RadioGroup
              aria-label="Estado petición"
              name="status"
              value={this.props.statusToUpdate}
              onChange={this.props.handleChangeStatus}
            >
              <FormControlLabel value="abierto" control={<Radio color={'default'} className={classes.colorAbierto} />} label="abierto" />
              <FormControlLabel value="validado" control={<Radio color={'default'} className={classes.colorValidado} />} label="validado" />
              <FormControlLabel value="cerrado" control={<Radio color={'default'} className={classes.colorCerrado} />} label="cerrado" />
            </RadioGroup>
            {/*<Select
              value={this.props.statusToUpdate}
              onChange={this.props.handleChangeStatus}
            >
              <MenuItem key={1} value={'abierto'}>abierto</MenuItem>
              <MenuItem key={2} value={'validado'}>validado</MenuItem>
              <MenuItem key={3} value={'cerrado'}>cerrado</MenuItem>
            </Select>*/}
          </FormControl>
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose}>
            Cerrar
          </Button>
          <Button onClick={this.props.handleUpdateStatus} color="primary">
            Cambiar estado&nbsp;&nbsp;
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

DialogStatus.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object.isRequired,
  statusToUpdate: PropTypes.string.isRequired,
  handleChangeStatus: PropTypes.func.isRequired,
  handleUpdateStatus: PropTypes.func.isRequired
}

export default withStyles(styles, { withTheme: true })(DialogStatus)
