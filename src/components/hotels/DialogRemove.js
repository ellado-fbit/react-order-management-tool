import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import ClearIcon from '@material-ui/icons/Clear'
import ErrorIcon from '@material-ui/icons/Error'
import DoneIcon from '@material-ui/icons/Done'
import Slide from '@material-ui/core/Slide'
import Typography from '@material-ui/core/Typography'
import axios from 'axios'

const styles = theme => ({
  errorTypography: {
    color: '#e91e63'
  },
  removedOkTypography: {
    color: 'green'
  }
})

function Transition(props) {
  return <Slide direction="left" {...props} />
}

class DialogRemove extends React.Component {
  state = {
    removedStatus: {removed: false, error: false, message: ''},
    disableRemoveButton: false
  }

  showRemovedStatus = () => {
    if (this.state.removedStatus.removed) {
      if (this.state.removedStatus.error) {
        return (
          <Typography variant="subtitle1" className={this.props.classes.errorTypography}>
            &nbsp;<ErrorIcon />&nbsp;{this.state.removedStatus.message}
          </Typography>
        )
      }
      else {
        return (
          <Typography variant="subtitle1" className={this.props.classes.removedOkTypography}>
            &nbsp;<DoneIcon />&nbsp;{this.state.removedStatus.message}
          </Typography>
        )
      }
    }
  }

  handleButtonRemove = () => {
    axios.delete(`/hotels/id/${this.props.register._id}`)
      .then((response) => {
        if (response.data.error) {
          if (response.data.error === 'INVALID_TOKEN' || response.data.error === 'REQUIRED_TOKEN') {
            return this.props.cleaningLoginSession()
          }
          this.setState({
            removedStatus: {
              removed: true,
              error: true,
              message: (response.data.error.constructor === String) ? response.data.error : JSON.stringify(response.data.error)
            },
            disableRemoveButton: true
          })
          this.props.onRefresh()
        }
        else {
          // OK
          this.setState({
            removedStatus: {
              removed: true,
              error: false,
              message: 'El hotel ha sido eliminado.'
            },
            disableRemoveButton: true
          })
          this.props.onRefresh()
          setTimeout(this.handleCloseDialog, 1500)
        }
      })
      .catch((error) => {
        this.setState({
          removedStatus: {
            removed: true,
            error: true,
            message: JSON.stringify(error)
          }
        })
      })

  }

  handleCloseDialog = () => {
    this.setState({
      removedStatus: {
        removed: false,
        error: false,
        message: ''
      },
      disableRemoveButton: false
    })
    this.props.onClose()
  }

  render() {
    return (
      <div>
        <Dialog
          open={this.props.isOpen}
          onClose={this.handleCloseDialog}
          TransitionComponent={Transition}
        >
          <DialogTitle>{"¿Está seguro que desea eleminar el hotel?"}</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1">
              {`${this.props.register.name} [${this.props.register.username}]`}
            </Typography>
            <br />
            {this.showRemovedStatus()}
            <br />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDialog} color="primary">
              Cerrar
            </Button>
            <Button onClick={this.handleButtonRemove} disabled={this.state.disableRemoveButton} color="secondary">
              Eliminar&nbsp;&nbsp;
              <ClearIcon />
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

DialogRemove.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  register: PropTypes.object.isRequired,
  onRefresh: PropTypes.func.isRequired,
  cleaningLoginSession: PropTypes.func.isRequired
}

export default withStyles(styles, { withTheme: true })(DialogRemove)
