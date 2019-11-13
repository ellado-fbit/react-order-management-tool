import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import FormControl from '@material-ui/core/FormControl'
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

class DialogCreateProvider extends React.Component {
  state = {
    code: '',
    name: '',
    // email: '',
    // phone: '',
    formValidationStatus: {error: false, message: ''},
    createdProviderStatus: {created: false, error: false, message: ''},
    disableCreateButton: false
  }

  handleFormCode = (e) => {
    this.setState({ code: e.target.value })
  }

  handleFormName = (e) => {
    this.setState({ name: e.target.value })
  }

  // handleFormEmail = (e) => {
  //   this.setState({ email: e.target.value })
  // }

  // handleFormPhone = (e) => {
  //   this.setState({ phone: e.target.value })
  // }

  validateForm = () => {
    if (this.state.code === '') {
      return 'Rellene el campo \'Código proveedor\''
    }
    if (this.state.name === '') {
      return 'Rellene el campo \'Nombre proveedor\''
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

  showCreatedProviderStatus = () => {
    if (this.state.createdProviderStatus.created) {
      if (this.state.createdProviderStatus.error) {
        return (
          <Typography variant="subtitle1" className={this.props.classes.errorTypography}>
            &nbsp;<ErrorIcon />&nbsp;{this.state.createdProviderStatus.message}
          </Typography>
        )
      }
      else {
        return (
          <Typography variant="subtitle1" className={this.props.classes.createdOkTypography}>
            &nbsp;<DoneIcon />&nbsp;{this.state.createdProviderStatus.message}
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
      setTimeout(() => { this.setState({formValidationStatus: {error: false, message: ''}}) }, 2000)
      return
    }

    // Creating new provider
    // -------------------
    let myProvider = {
      code: this.state.code.trim(),
      name: this.state.name.trim()
    }
    // if (this.state.email !== '') {
    //   myProvider.email = this.state.email
    // }
    // if (this.state.phone !== '') {
    //   myProvider.phone = this.state.phone
    // }

    axios.post(`/providers/`, myProvider)
      .then((response) => {
        if (response.data.error) {
          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          }
          // console.log('error: ' + JSON.stringify(response.data.error))
          this.setState({
            createdProviderStatus: {
              created: true,
              error: true,
              message: (response.data.error.constructor === String) ? response.data.error.replace('\'code\'', '\'Código\'') : JSON.stringify(response.data.error)
            }
          })
          this.props.onRefresh()
        }
        else {
          // OK
          this.setState({
            createdProviderStatus: {
              created: true,
              error: false,
              message: 'Nuevo proveedor creado correctamente!'
            },
            disableCreateButton: true
          })
          this.props.onRefresh()
          setTimeout(this.handleCloseDialog, 1500)
        }
      })
      .catch((error) => {
        this.setState({
          createdProviderStatus: {
            created: true,
            error: true,
            message: JSON.stringify(error)
          }
        })
      })
  }

  handleCloseDialog = () => {
    this.setState({
      code: '',
      name: '',
      // email: '',
      // phone: '',
      formValidationStatus: {error: false, message: ''},
      createdProviderStatus: {created: false, error: false, message: ''},
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
        <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Rellene los siguientes campos para crear un nuevo proveedor.
          </DialogContentText>
          <FormControl className={classes.formControl}>
            <TextField
              id="code"
              label="Código proveedor"
              value={this.state.code}
              onChange={this.handleFormCode}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              id="name"
              label="Nombre proveedor"
              value={this.state.name}
              onChange={this.handleFormName}
            />
          </FormControl>
          {/*<FormControl className={classes.formControl}>
            <TextField
              id="email"
              label="Email"
              value={this.state.email}
              onChange={this.handleFormEmail}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              id="phone"
              label="Phone number"
              value={this.state.phone}
              onChange={this.handleFormPhone}
            />
          </FormControl>*/}
          <br /><br />
          {this.showFormValidationStatus()}
          {this.showCreatedProviderStatus()}
          <br />
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

DialogCreateProvider.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles, { withTheme: true })(DialogCreateProvider)
