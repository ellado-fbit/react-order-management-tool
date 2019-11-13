import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Slide from '@material-ui/core/Slide'
import Typography from '@material-ui/core/Typography'
import ErrorIcon from '@material-ui/icons/Error'
import DoneIcon from '@material-ui/icons/Done'
import axios from 'axios'

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit / 4,
    minWidth: 700,
    maxWidth: 700
  },
  errorTypography: {
    color: '#e91e63'
  },
  createdOkTypography: {
    color: 'green'
  }
})

function Transition(props) {
  return <Slide direction="down" {...props} />
}

class DialogCreate extends React.Component {
  state = {
    selectedPreOrderIndex: '',
    formValidationStatus: {error: false, message: ''},
    createdStatus: {created: false, error: false, message: ''},
    disableCreateButton: false
  }

  handleFormPreorder = (e) => {
    this.setState({
      selectedPreOrderIndex: e.target.value
    })
  }

  validateForm = () => {
    if (this.state.selectedPreOrderIndex === '') {
      return 'Seleccione un tipo de contrato'
    }
    return 'OK'
  }

  showFormValidationStatus = () => {
    if (this.state.formValidationStatus.error) {
      return (
        <Typography variant="subtitle1" className={this.props.classes.errorTypography}>
          &nbsp;<ErrorIcon />&nbsp;{this.state.formValidationStatus.message}
        </Typography>
      )
    }
    else {
      return (
        <Typography variant="subtitle1">
          &nbsp;
        </Typography>
      )
    }
  }

  showCreatedStatus = () => {
    if (this.state.createdStatus.created) {
      if (this.state.createdStatus.error) {
        return (
          <Typography variant="subtitle1" className={this.props.classes.errorTypography}>
            &nbsp;<ErrorIcon />&nbsp;{this.state.createdStatus.message}
          </Typography>
        )
      }
      else {
        return (
          <Typography variant="subtitle1" className={this.props.classes.createdOkTypography}>
            &nbsp;<DoneIcon />&nbsp;{this.state.createdStatus.message}
          </Typography>
        )
      }
    }
  }

  handleButtonCreate = () => {

    // Validating form
    // ----------------
    let validation = this.validateForm()

    if (validation !== 'OK') {
      this.setState({
        formValidationStatus: {error: true, message: validation}
      })
      setTimeout(() => { this.setState({formValidationStatus: {error: false, message: ''}}) }, 2500)
      return
    }

    // Creating new order
    // -------------------
    let myOrder = this.props.preorders[this.state.selectedPreOrderIndex]
    myOrder.creation_date = ''  // to be setted on server side

    axios.post(`/orders/`, myOrder)
      .then((response) => {
        if (response.data.error) {
          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          }
          this.setState({
            createdStatus: {
              created: true,
              error: true,
              message: (response.data.error.constructor === String) ? response.data.error : JSON.stringify(response.data.error)
            }
          })
          this.props.onRefreshOrders()
        }
        else {
          // OK
          this.setState({
            createdStatus: {
              created: true,
              error: false,
              message: 'Nuevo pedido creado correctamente!'
            },
            disableCreateButton: true
          })
          this.props.onRefreshOrders()
          setTimeout(this.handleCloseDialog, 1500)
        }
      })
      .catch((error) => {
        this.setState({
          createdStatus: {
            created: true,
            error: true,
            message: JSON.stringify(error)
          }
        })
      })
  }

  handleCloseDialog = () => {
    this.setState({
      selectedPreOrderIndex: '',
      formValidationStatus: {error: false, message: ''},
      createdStatus: {created: false, error: false, message: ''},
      disableCreateButton: false
    })
    this.props.onClose()
  }

  render() {
    const { classes } = this.props

    return (
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={this.props.isOpen}
        onClose={this.handleCloseDialog}
        TransitionComponent={Transition}
      >
        <DialogTitle>Crear Pedido</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &nbsp;
          </DialogContentText>
          <FormControl className={classes.formControl}>
            <InputLabel>Elegir tipo de contrato:</InputLabel>
            <Select
              value={this.state.selectedPreOrderIndex}
              onChange={this.handleFormPreorder}
            >
              {this.props.preorders.map((preorder, index) => (
                <MenuItem key={index + 1} value={index}>{`${preorder.provider_name} [${preorder.store_name}]`}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <br /><br />
          {this.showFormValidationStatus()}
          {this.showCreatedStatus()}
          <br /><br />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCloseDialog}>
            Cerrar
          </Button>
          <Button onClick={this.handleButtonCreate} disabled={this.state.disableCreateButton} color="primary">
            Crear&nbsp;&nbsp;
            <AddCircleIcon />
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

DialogCreate.propTypes = {
  classes: PropTypes.object.isRequired,
  preorders: PropTypes.array.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRefreshOrders: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles, { withTheme: true })(DialogCreate)
