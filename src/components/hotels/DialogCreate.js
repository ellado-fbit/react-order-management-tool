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

class DialogCreate extends React.Component {
  state = {
    code: '',
    name: '',
    username: '',
    pwd: '',
    formValidationStatus: {error: false, message: ''},
    createdStatus: {created: false, error: false, message: ''},
    disableCreateButton: false
  }

  handleFormCode = (e) => {
    this.setState({ code: e.target.value })
  }

  handleFormName = (e) => {
    this.setState({ name: e.target.value })
  }

  handleFormUsername = (e) => {
    this.setState({ username: e.target.value })
  }

  handleFormPwd = (e) => {
    this.setState({ pwd: e.target.value })
  }

  validateForm = () => {
    if (this.state.code === '') {
      return 'Rellene el campo \'Código\''
    }
    if (/\s/g.test(this.state.code)) {
      return 'El campo \'Código\' no puede contener espacios'
    }

    // Check if code introduced already exists
    // ----------------------------------------
    const codes = this.props.hotels.map(x => { return x.code })
    if (codes.includes(this.state.code)) {
      return 'El código introducido ya existe, use otro valor'
    }

    if (this.state.name === '') {
      return 'Rellene el campo \'Nombre del hotel\''
    }
    if (this.state.username === '') {
      return 'Rellene el campo \'Nombre de usuario\''
    }
    if (/\s/g.test(this.state.username)) {
      return 'El campo \'Nombre de usuario\' no puede contener espacios'
    }
    if (this.state.pwd === '') {
      return 'Rellene el campo \'Contraseña\''
    }
    if (/\s/g.test(this.state.pwd)) {
      return 'El campo \'Contraseña\' no puede contener espacios'
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
      setTimeout(() => { this.setState({formValidationStatus: {error: false, message: ''}}) }, 2000)
      return
    }

    // Creating new register
    // ----------------------
    let myRegister = {
      code: this.state.code.trim(),
      name: this.state.name.trim(),
      username: this.state.username,
      pwd: this.state.pwd
    }

    axios.post(`/hotels/`, myRegister)
      .then((response) => {
        if (response.data.error) {
          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          }
          this.setState({
            createdStatus: {
              created: true,
              error: true,
              message: (response.data.error.constructor === String) ? response.data.error.replace('\'username\'', '\'Nombre de usuario\'') : JSON.stringify(response.data.error)
            }
          })
          this.props.onRefresh()
        }
        else {
          // OK
          // console.log('OK!')
          this.setState({
            createdStatus: {
              created: true,
              error: false,
              message: 'Nuevo hotel creado correctamente!'
            },
            disableCreateButton: true
          })
          this.props.onRefresh()
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
      code: '',
      name: '',
      username: '',
      pwd: '',
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
        <DialogTitle>Crear Nuevo Hotel</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Rellene los siguientes campos para crear un nuevo hotel.
          </DialogContentText>
          <FormControl className={classes.formControl}>
            <TextField
              id="code"
              label="Código"
              value={this.state.code}
              onChange={this.handleFormCode}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              id="name"
              label="Nombre del hotel"
              value={this.state.name}
              onChange={this.handleFormName}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              id="username"
              label="Nombre de usuario (para autenticación)"
              value={this.state.username}
              onChange={this.handleFormUsername}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              id="pwd"
              label="Contraseña (para autenticación)"
              value={this.state.pwd}
              onChange={this.handleFormPwd}
            />
          </FormControl>
          <br /><br />
          {this.showFormValidationStatus()}
          {this.showCreatedStatus()}
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

DialogCreate.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hotels: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles, { withTheme: true })(DialogCreate)
