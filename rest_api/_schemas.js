const store_ids = require('./_store_type_ids')

// Provider schema
// ----------------
const provider_schema = [
  {fieldName: 'code', isMandatory: true, isUnique: true},
  {fieldName: 'name', isMandatory: true},
  {fieldName: 'email'},
  {fieldName: 'phone'}
]

// Hotel schema
// -------------
const hotel_schema = [
  {fieldName: 'username', isMandatory: true, isUnique: true},
  {fieldName: 'pwd', isMandatory: true},
  {fieldName: 'code', isMandatory: true},
  {fieldName: 'name', isMandatory: true},
  {fieldName: 'email'},
  {fieldName: 'phone'},
  {fieldName: 'zone'}
]

// Item schema
// ------------
const item_schema = [
  {fieldName: 'code', isMandatory: true, isUnique: true},
  {fieldName: 'name', isMandatory: true},
  {fieldName: 'format', isMandatory: true}
]

// Contract schema
// ----------------
const contract_schema = [
  {fieldName: 'provider_code', isMandatory: true},
  {fieldName: 'item_codes', isMandatory: true},
  {fieldName: 'store_id', isMandatory: true, allowedValues: store_ids.map((x) => { return x.id })},
  {fieldName: 'sortable_name', isMandatory: true},  // compound by provider name and store name
  {fieldName: 'references'}
]

// Order schema
// -------------
const order_schema = [
  {fieldName: 'hotel_username', isMandatory: true},
  {fieldName: 'hotel_name', isMandatory: true},
  {fieldName: 'creation_date', isMandatory: true},
  {fieldName: 'provider_code', isMandatory: true},
  {fieldName: 'provider_name', isMandatory: true},
  {fieldName: 'store_id', isMandatory: true},
  {fieldName: 'store_name', isMandatory: true},
  {fieldName: 'item_codes', isMandatory: true},
  {fieldName: 'item_names', isMandatory: true},
  {fieldName: 'item_formats', isMandatory: true},
  {fieldName: 'references'},
  {fieldName: 'qtys', isMandatory: true},
  {fieldName: 'delivery_dates'},
  {fieldName: 'status', isMandatory: true, allowedValues: ['abierto', 'validado', 'cerrado']},
  {fieldName: 'sortable_name', isMandatory: true}  // compound by: creation date, hotel name, provider name, store name, status
]

// Login schema
// -------------
const login_schema = [
  {fieldName: 'username', isMandatory: true},
  {fieldName: 'pwd', isMandatory: true}
]

module.exports = {
  provider_schema: provider_schema,
  hotel_schema: hotel_schema,
  item_schema: item_schema,
  contract_schema: contract_schema,
  order_schema: order_schema,
  login_schema: login_schema
}
