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
import SelectItem from './SelectItem'
import IconButton from '@material-ui/core/IconButton'
import ClearIcon from '@material-ui/icons/Clear'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

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
    marginTop: theme.spacing.unit * 4,
    marginLeft: '7%'
  },
  forms: {
    width: '85%',
    marginTop: theme.spacing.unit * 2,
    marginLeft: '7%'
  }
})

function Transition(props) {
  return <Slide direction="up" {...props} />
}

class DialogCreateUpdateContract extends React.Component {

  // handleUpdateFormQty = (updateQty, e) => {
  //   this.props.onUpdateFormQty(updateQty, e.target.value)
  // }

  getItem = (item_code) => {
    return this.props.items.find(x => x.code === item_code)
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
              <Button color="inherit" onClick={this.props.onClickSaveButton} disabled={this.props.disableSaveButton}>
                <SaveIcon />
                &nbsp;&nbsp;Guardar
              </Button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.props.statusMessage}
            </Toolbar>
          </AppBar>
          {this.props.isNewContract &&
            <div>
              <FormControl className={classes.forms}>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={this.props.shownContract.provider_code}
                  onChange={ (e) => {this.props.onHandleFormProviderCode(e)} }
                >
                  {this.props.providers.map((prov) => (
                    <MenuItem key={prov._id} value={prov.code}>{`(${prov.code}) ${prov.name}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl className={classes.forms}>
                <InputLabel>Almacén</InputLabel>
                <Select
                  value={this.props.shownContract.store_id}
                  onChange={ (e) => {this.props.onHandleFormStoreId(e)} }
                >
                  {this.props.storeIds.map((sto) => (
                    <MenuItem key={sto.id} value={sto.id}>{`${sto.name}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          }
          {!this.props.isNewContract &&
            <Typography variant="h5" className={classes.grow}>
              Contrato:&nbsp;{this.props.shownContract.provider_name}&nbsp;[{this.props.shownContract.store_name}]
            </Typography>
          }
          <div className={classes.grow}>
            <SelectItem
              items={this.props.items}
              shownContract={this.props.shownContract}
              onAddItemToList={this.props.onAddItemToList}
            />
            <br />
            <Typography variant="subtitle1">
              Número de artículos actuales:&nbsp;{this.props.shownContract.item_codes.length}
            </Typography>
            <br />
            <Table padding={'dense'}>
              <TableBody>
                {this.props.shownContract.item_codes.map((item_code, index) => (
                  <TableRow className={classes.row} key={index + 1}>
                    <CustomTableCell align="left">{this.getItem(item_code).code}</CustomTableCell>
                    <CustomTableCell align="left">{this.getItem(item_code).name}</CustomTableCell>
                    <CustomTableCell align="left">{this.getItem(item_code).format}</CustomTableCell>
                    <CustomTableCell align="left">
                      <TextField
                        label="Referencia"
                        value={this.props.shownContract.references[index]}
                        onChange={(e) => this.props.onChangeReference(index, e)}
                      />
                    </CustomTableCell>
                    <CustomTableCell align="left">
                      <IconButton variant="contained" onClick={() => this.props.onRemoveItemFromList(item_code)} color="secondary">
                        <ClearIcon />
                      </IconButton>
                    </CustomTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <br /><br /><br />
        </Dialog>
      </div>
    )
  }
}

DialogCreateUpdateContract.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  providers: PropTypes.array.isRequired,
  storeIds: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  isNewContract: PropTypes.bool.isRequired,
  shownContract: PropTypes.object.isRequired,
  onClickSaveButton: PropTypes.func,
  disableSaveButton: PropTypes.bool,
  onAddItemToList: PropTypes.func.isRequired,
  onRemoveItemFromList: PropTypes.func.isRequired,
  onHandleFormProviderCode: PropTypes.func.isRequired,
  onHandleFormStoreId: PropTypes.func.isRequired,
  statusMessage: PropTypes.string,
  onChangeReference: PropTypes.func.isRequired
}

export default withStyles(styles)(DialogCreateUpdateContract)
