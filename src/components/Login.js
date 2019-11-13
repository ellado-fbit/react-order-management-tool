import React from 'react'
import PropTypes from 'prop-types'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import FormControl from '@material-ui/core/FormControl'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import withStyles from '@material-ui/core/styles/withStyles'
import ErrorIcon from '@material-ui/icons/Error'

const styles = (theme) => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
  errorTypography: {
    color: '#e91e63'
  }
})

class Login extends React.Component {

  showLoginStatus = () => {
    if (this.props.loginStatus.error) {
      return (
        <Typography variant="subtitle1" className={this.props.classes.errorTypography}>
          &nbsp;<ErrorIcon />&nbsp;{this.props.loginStatus.message}
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


  render() {
    const { classes } = this.props

    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Autenticación
          </Typography>
          <form className={classes.form}>
            <FormControl margin="normal" fullWidth>
              <InputLabel htmlFor="username">Nombre de usuario</InputLabel>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                autoFocus
                value={this.props.username}
                onChange={ (e) => {this.props.onHandleUsername(e)} }
              />
            </FormControl>
            <FormControl margin="normal" fullWidth>
              <InputLabel htmlFor="password">Contraseña</InputLabel>
              <Input
                name="password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={this.props.password}
                onChange={ (e) => {this.props.onHandlePassword(e)} }
              />
            </FormControl>
            <br />
            {this.showLoginStatus()}
            <br />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={this.props.onHandleClickLoginButton}
            >
              Entrar
            </Button>
          </form>
        </Paper>
      </main>
    )
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  onHandleUsername: PropTypes.func.isRequired,
  onHandlePassword: PropTypes.func.isRequired,
  onHandleClickLoginButton: PropTypes.func.isRequired,
  loginStatus: PropTypes.object.isRequired
}

export default withStyles(styles)(Login)
