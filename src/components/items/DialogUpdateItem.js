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
import FormControl from '@material-ui/core/FormControl'
import Slide from '@material-ui/core/Slide'
import Typography from '@material-ui/core/Typography'
import ErrorIcon from '@material-ui/icons/Error'

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

class DialogUpdateItem extends React.Component {
  state = {
    formValidationStatus: {error: false, message: ''},
  }

  handleFormName = (e) => {
    this.props.onChangeName(e.target.value)
  }

  handleFormFormat = (e) => {
    this.props.onChangeFormat(e.target.value)
  }

  validateForm = () => {
    if (this.props.itemNameToUpdate === '') {
      return 'Rellene el campo \'Nombre artículo\''
    }
    if (this.props.itemFormatToUpdate === '') {
      return 'Rellene el campo \'Formato\''
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

  handleButtonUpdate = () => {

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

    this.props.onHandleUpdate()
  }

  render() {
    const { classes } = this.props

    return (
      <Dialog
        fullWidth={true}
        maxWidth={'md'}
        open={this.props.isOpen}
        onClose={this.props.onClose}
        TransitionComponent={Transition}
      >
        <DialogTitle>Modificar Artículo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &nbsp;
          </DialogContentText>
          <FormControl className={classes.formControl}>
            <TextField
              id="name"
              label="Nombre artículo"
              value={this.props.itemNameToUpdate}
              onChange={this.handleFormName}
            />
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              id="format"
              label="Formato"
              value={this.props.itemFormatToUpdate}
              onChange={this.handleFormFormat}
            />
          </FormControl>
          <br /><br />
          {this.showFormValidationStatus()}
          <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose}>
            Cerrar
          </Button>
          <Button onClick={this.handleButtonUpdate} color="primary">
            Modificar
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

DialogUpdateItem.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  itemNameToUpdate: PropTypes.string.isRequired,
  itemFormatToUpdate: PropTypes.string.isRequired,
  onChangeName: PropTypes.func.isRequired,
  onChangeFormat: PropTypes.func.isRequired,
  onHandleUpdate: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles, { withTheme: true })(DialogUpdateItem)
