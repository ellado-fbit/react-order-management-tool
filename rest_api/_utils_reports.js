const PDFDocument = require('pdfkit')
const moment = require('moment')

// --------------
// CSV generator
// --------------
const generate_csv = (order) => {

  // Generating csv rows
  // --------------------
  let rows_csv = []

  rows_csv.push('"Proveedor","Almacén","Artículo","Cantidad","Formato","Referencias"')  // CSV header

  order.item_codes.forEach((item_code, index) => {
    let reference = ''
    if (order.references) reference = order.references[index]
    rows_csv.push(`"${order.provider_name}","${order.store_name}","${order.item_names[index]} [${item_code}]","${order.qtys[index]}","${order.item_formats[index]}","${reference}"`)
  })

  if (order.delivery_dates) {
    rows_csv.push('')  // blank line
    rows_csv.push(`"","","","","","","Fechas de entrega:","${order.delivery_dates}"`)
  }

  return rows_csv.join('\n')
}

// --------------
// PDF generator
// --------------
const generate_pdf = (order, res) => {
  const doc = new PDFDocument
  doc.pipe(res)

  // Cover page
  // -----------
  doc.text(` `)
  doc.text(` `)
  doc.text(` `)
  doc.text(` `)
  doc.font('Courier').fontSize(18).text(`${order.provider_name.toUpperCase()} (${order.store_name.toUpperCase()})`, { align: 'center' })
  doc.font('Courier').fontSize(18).text(`(${order.hotel_name.toUpperCase()})`, { align: 'center' })
  doc.text(` `)
  doc.font('Courier').fontSize(12).text(`Informe creado: ${moment().format('DD-MM-YYYY HH:mm')}`, { align: 'center' })

  // Items, quantities and formats
  // ------------------------------
  const createOrderPage = () => {
    let myPage = doc.addPage().font('Courier').fontSize(11)

    order.item_codes.forEach((item_code, index) => {
      if (order.qtys[index] !== '') {
        let pointsLength = 70 - order.qtys[index].length - order.item_formats[index].length - 2
        if (pointsLength < 0) { pointsLength = 0 }
        myPage.text(`${order.item_names[index].toUpperCase()} (${item_code})`, { align: 'left' })
        myPage.text(`${'.'.repeat(pointsLength)} ${order.qtys[index]} ${order.item_formats[index].toUpperCase()}`, { align: 'right' })

        // includes reference if exists
        // -----------------------------
        if (order.references) {
          let reference = order.references[index]
          myPage.text(`${reference}`, { align: 'right' })
        }

        myPage.text(` `)
      }
    })
    return myPage
  }

  createOrderPage()

  // Delivery Dates
  // ---------------
  if (order.delivery_dates) {
    doc.text(` `)
    doc.text(` `)
    doc.text(` `)
    doc.text(` `)
    doc.font('Courier').fontSize(12).text('FECHAS DE ENTREGA', { align: 'left' })
    doc.font('Courier').fontSize(11).text('.'.repeat(70), { align: 'left' })
    doc.text(` `)
    doc.font('Courier').fontSize(11).text(`${order.delivery_dates.toUpperCase()}`, { align: 'left' })
    doc.text(` `)
  }

  doc.end()
}

module.exports = {
  generate_csv: generate_csv,
  generate_pdf: generate_pdf
}
