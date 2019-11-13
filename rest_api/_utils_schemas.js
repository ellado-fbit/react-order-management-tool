
// Schema format
// --------------
// [
//   {fieldName: 'username', isMandatory: true, isUnique: true},  // only one unique field is allowed
//   {fieldName: 'pwd', isMandatory: true},
//   {fieldName: 'role', allowedValues: ['admin', 'basic']}
// ]

// Check allowed fields of a schema
// ---------------------------------
const checkAllowedFields = (schema, fields_to_check) => {
  const allowed_fields = schema.map((x) => { return x.fieldName })

  let result = {}

  fields_to_check.forEach((field) => {
    if (!allowed_fields.includes(field)) {
      result = { error: `Error: Campo '${field}' no permitido.` }
    }
  })

  return result
}

// Check mandatory fields of a schema
// -----------------------------------
const checkMandatoryFields = (schema, fields_to_check) => {
  const mandatory_fields = schema.filter((x) => { return x.isMandatory }).map((x) => { return x.fieldName })

  let result = {}
  mandatory_fields.forEach((man_field) => {
    if (!fields_to_check.includes(man_field)) {
      result = { error: `Error: El campo '${man_field}' es obligatorio.` }
    }
  })

  return result
}

// Check allowed values (Note: body = { field1: value1, field2: value: 2, ...})
// -----------------------------------------------------------------------------
const checkAllowedValues = (schema, body) => {
  const body_fields = Object.keys(body)

  let result = {}
  body_fields.forEach((body_field) => {

    let field_in_schema = schema.filter((x) => { return (x.fieldName === body_field && x.allowedValues) })

    if (field_in_schema.length > 0) {
      field_in_schema = field_in_schema[0]
      if (!field_in_schema.allowedValues.includes(body[body_field])) {
        result = { error: `Error: El campo '${body_field}' tiene un valor no permitido. Valores permitidos: ${field_in_schema.allowedValues.join(', ')}.` }
      }
    }
  })

  return result
}

module.exports = {
  checkAllowedFields: checkAllowedFields,
  checkMandatoryFields: checkMandatoryFields,
  checkAllowedValues: checkAllowedValues
}
