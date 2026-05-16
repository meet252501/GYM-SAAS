const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceService {
  static async generateInvoice(payment, gym) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        doc
          .fillColor('#444444')
          .fontSize(20)
          .text(gym.name || 'GymCore Pro', 50, 57)
          .fontSize(10)
          .text(gym.address || 'Gym Address', 200, 50, { align: 'right' })
          .text(gym.phone || 'Gym Contact', 200, 65, { align: 'right' })
          .moveDown();

        doc.heightLine(1).strokeColor('#cccccc').moveTo(50, 90).lineTo(550, 90).stroke();

        // Invoice Info
        doc
          .fillColor('#444444')
          .fontSize(15)
          .text('INVOICE', 50, 110);

        doc
          .fontSize(10)
          .text(`Invoice Number: INV-${payment._id.toString().substring(0, 8).toUpperCase()}`, 50, 135)
          .text(`Invoice Date: ${new Date(payment.paidAt).toLocaleDateString()}`, 50, 150)
          .text(`Payment ID: ${payment._id}`, 50, 165)
          .moveDown();

        // Member Info
        doc
          .fontSize(12)
          .text('Bill To:', 50, 200)
          .fontSize(10)
          .text(payment.memberName, 50, 215)
          .moveDown();

        // Table Header
        const tableTop = 250;
        doc
          .fontSize(10)
          .text('Description', 50, tableTop, { bold: true })
          .text('Type', 200, tableTop)
          .text('Method', 300, tableTop)
          .text('Amount', 400, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Content
        const itemTop = tableTop + 25;
        doc
          .fontSize(10)
          .text(`Membership Payment - ${payment.type}`, 50, itemTop)
          .text(payment.type, 200, itemTop)
          .text(payment.gateway.toUpperCase(), 300, itemTop)
          .text(`INR ${payment.amount.toFixed(2)}`, 400, itemTop, { align: 'right' });

        doc.moveTo(50, itemTop + 15).lineTo(550, itemTop + 15).stroke();

        // Total
        const totalTop = itemTop + 35;
        doc
          .fontSize(12)
          .text('Total Amount Paid:', 300, totalTop, { bold: true })
          .text(`INR ${payment.amount.toFixed(2)}`, 400, totalTop, { align: 'right', bold: true });

        // Footer
        doc
          .fontSize(10)
          .text('Thank you for choosing GymCore Pro. Stay Fit!', 50, 700, { align: 'center', width: 500 });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = InvoiceService;
