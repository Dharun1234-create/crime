const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const FIR = require('../models/FIR');
const path = require('path');

/**
 * Generates an official FIR PDF document from the database record
 */
exports.generateFIRPdf = async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id);
    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers to trigger download/view
    const filename = `FIR_${fir.firNumber.replace(/\//g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the PDF directly to the response
    doc.pipe(res);

    // --- Header Section ---
    // Note: We'll use bold fonts for headers
    doc.fontSize(20).font('Helvetica-Bold').text('POLICE DEPARTMENT', { align: 'center' });
    doc.fontSize(14).text('GOVERNMENT OF TAMIL NADU', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(10).font('Helvetica').text(`Station: ${fir.policeStation}  |  District: ${fir.district}`, { align: 'center' });
    doc.moveDown();
    
    // Horizontal Line
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#000').lineWidth(2).stroke();
    doc.moveDown();

    // --- FIR ID Section ---
    doc.rect(50, doc.y, 495, 40).fill('#f1f5f9');
    doc.fillColor('#1e40af').fontSize(8).font('Helvetica-Bold').text('FIRST INFORMATION REPORT NO.', 60, doc.y + 8);
    doc.fontSize(16).text(fir.firNumber, 60, doc.y + 12);
    
    doc.fillColor('#64748b').fontSize(8).text('DATE OF REGISTRATION', 400, doc.y - 20);
    doc.fillColor('#000').fontSize(10).text(new Date(fir.createdAt).toLocaleString(), 400, doc.y + 10);
    doc.moveDown(3);

    // --- Sections Helper ---
    const drawSectionHeader = (title, color = '#334155') => {
      doc.moveDown();
      doc.fillColor(color).fontSize(10).font('Helvetica-Bold').text(title.toUpperCase());
      doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).strokeColor('#e2e8f0').lineWidth(1).stroke();
      doc.moveDown(0.5);
    };

    const drawField = (label, value, xOffset = 0) => {
      const currentY = doc.y;
      doc.fillColor('#64748b').fontSize(7).font('Helvetica-Bold').text(label.toUpperCase(), 50 + xOffset, currentY);
      doc.fillColor('#000').fontSize(10).font('Helvetica').text(value || 'N/A', 50 + xOffset, currentY + 10);
    };

    // --- I. Complainant ---
    drawSectionHeader('I. Details of Complainant / Informant');
    drawField('Full Name', fir.complainantName);
    drawField('Age', `${fir.complainantAge} Years`, 250);
    doc.moveDown(2);
    drawField('Contact', fir.complainantContact);
    drawField('Occupation', 'Not Specified', 250);
    doc.moveDown(2);
    drawField('Address', fir.complainantAddress);

    // --- II. Occurrence ---
    drawSectionHeader('II. Details of Occurrence');
    drawField('Date of Incident', new Date(fir.date).toLocaleDateString());
    drawField('Time', fir.incidentTime, 250);
    doc.moveDown(2);
    drawField('Place of Occurrence', `${fir.location}, ${fir.district}`);

    // --- III. Offence ---
    drawSectionHeader('III. Nature of Offence');
    drawField('Crime Category', fir.crimeType);
    drawField('Accused Details', fir.accusedDetails || 'Unknown', 250);
    doc.moveDown(2);
    drawField('Case Title', fir.title);
    doc.moveDown(2);
    doc.fillColor('#64748b').fontSize(7).font('Helvetica-Bold').text('DESCRIPTION OF COMPLAINT', 50, doc.y);
    doc.fillColor('#000').fontSize(9).font('Helvetica-Oblique').text(fir.description, { width: 495, align: 'justify' });

    // --- IV. Investigation ---
    drawSectionHeader('IV. Investigation Team');
    drawField('Investigating Officer', fir.assignedOfficerName);
    doc.moveDown(3);

    // --- Signature Section ---
    const sigY = doc.y;
    doc.font('Helvetica-Bold').fontSize(8).text('OFFICER IN CHARGE', 400, sigY);
    doc.moveTo(400, sigY + 30).lineTo(520, sigY + 30).strokeColor('#94a3b8').lineWidth(0.5).dash(5, { space: 2 }).stroke();
    doc.undash();
    doc.fontSize(7).font('Helvetica-Oblique').text('Digital Signature Placeholder', 400, sigY + 35);

    // --- Footer & QR Code ---
    // Generate QR Code as Buffer
    const qrText = `https://police.tn.gov.in/verify/${fir.firNumber}`;
    const qrBuffer = await QRCode.toBuffer(qrText, { margin: 1, width: 100 });
    
    doc.image(qrBuffer, 50, 720, { width: 60 });
    doc.fillColor('#94a3b8').fontSize(7).text('VERIFICATION QR CODE', 120, 735);
    doc.text('SCAN TO VERIFY OFFICIAL RECORD IN STATE REGISTRY', 120, 745);

    doc.fillColor('#cbd5e1').fontSize(8).text('CONFIDENTIAL DOCUMENT | AUTHORIZED COPIES ONLY', 400, 760, { align: 'right' });

    // --- Watermark (Semi-transparent) ---
    // We add this last so it overlays or use opacity
    doc.fillColor('#000', 0.03);
    doc.fontSize(60).font('Helvetica-Bold').text('OFFICIAL COPY', 150, 400, {
      opacity: 0.1,
      rotation: 45
    });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
