import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const printRow = (doc, label, value, labelFont='Bold', valueFont = 'Regular', x = 40, labelWidth = 120 ) => {
    doc.fontSize(10);

    doc.font(labelFont)
        .text(label + ": ", x, doc.y, { width: labelWidth, continued: true });

    doc.font(valueFont)
        .text(value);

    doc.moveDown(0.4);
};

export const GenerateReceiptPDF = async (order, res) => {
    try {
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=reciept-${Math.floor(
                100000 + Math.random() * 199999
            )}.pdf`
        );

        doc.pipe(res);

        // ---- Font Setup ----
        const NotoRegular = path.join(process.cwd(), 'invoice-fonts', 'NotoSans-Regular.ttf');
        const NotoBold = path.join(process.cwd(), 'invoice-fonts', 'NotoSans-Bold.ttf');
        const NotoBoldItalic = path.join(process.cwd(), 'invoice-fonts', 'NotoSans-BoldItalic.ttf');
        const NotoItalic = path.join(process.cwd(), 'invoice-fonts', 'NotoSans-Italic.ttf');

        if (!fs.existsSync(NotoRegular)) {
            console.warn("Custom font not found, using default Helvetica");
            doc.font('Helvetica');
        } else {
            doc.registerFont('Regular', NotoRegular);
            doc.registerFont('Bold', NotoBold);
            doc.registerFont('Italic', NotoItalic);
            doc.registerFont('Bold-Italic', NotoBoldItalic);
        }

        // ---- Header ----------
        doc.font('Bold').fontSize(12).text('Tax Invoice / Receipt', 0, 40, { align: 'right' });
        doc.moveDown(3);

        // Column Setup
        const leftX = 40;
        const rightX = doc.page.width - 160;
        let topY = doc.y;

        // ---- Order Details ----
        doc.y = topY;
        printRow(doc, "Order Number", order._id, 'Bold', 'Regular', 40 );
        printRow(doc, "Order Date", new Date(order.createdAt).toLocaleString(), 'Bold', 'Regular', 40 );
        printRow(doc, "Seller", order.vendorId.businessName);
        printRow(doc, "Payment Method", order.paymentMethod ==='COD' ? 'Cash-On-Delivery': order.paymentMethod, 'Bold', 'Regular', 40 );
        printRow(doc, "Order Status", order.status ==='pending' ? 'Cashed' : 'Paid', 'Bold', 'Regular', 40 );

        // Save the final Y of left side
        const leftEndY = doc.y;

        // ---- Logo --------------
        const logoUrl = `https://res.cloudinary.com/degkx702f/image/upload/v1746947947/MyPortfolio/User/OMPRAKASH%27_%271746947943972.png`;
        const logoRes = await axios.get(logoUrl, {responseType: 'arraybuffer'});
        const logoBuffer = Buffer.from(logoRes.data);

        const logoWidth = 120;
        const logoHeight = 120;

        doc.image(logoBuffer, rightX, topY, {width: logoWidth, height: logoHeight});
        
        doc.y = Math.max(leftEndY, topY + logoHeight) + 20;

        doc.moveDown(1);

        doc.strokeColor('#cccccc')
            .lineWidth(1)
            .moveTo(40, doc.y)
            .lineTo(560, doc.y)
            .stroke();

        doc.moveDown(1);

        // ---- Shipping & Billing Address ----
        const baseY = doc.y;
        
        // LEFT 
        doc.fontSize(12.5).font('Bold-Italic').text('Shipping Address', 40, baseY, { underline: true }).moveDown(0.5);
        let leftY = doc.y + 5;

        const address = `${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.postalCode}` || 'N/A'
        printRow(doc, 'Address', address, 'Bold-Italic', 'Italic', 40, 220);
        printRow(doc, 'Name', order.shippingAddress.name, 'Bold-Italic', 'Italic', 40);
        printRow(doc, 'Contact: ', order.shippingAddress.phone, 'Bold-Italic', 'Italic', 40);

        // RIGHT
        doc.fontSize(12.5).font('Bold-Italic').text('Billing Address', 300, baseY, { underline: true }).moveDown(0.5);
        let rightStartY = baseY + 20;
        printRow(doc, 'Address', address ?? 'N/A', 'Bold-Italic', 'Italic', 300, 220);
        printRow(doc, 'Name', order.shippingAddress.name ?? 'N/A', 'Bold-Italic', 'Italic', 300);
        printRow(doc, 'Contact', order.shippingAddress.phone ?? 'N/A', 'Bold-Italic', 'Italic', 300);
        

        doc.moveDown(1);

        // ---- Line ----
        doc.strokeColor('#cccccc')
            .moveTo(40, doc.y)
            .lineTo(560, doc.y)
            .stroke();

        doc.moveDown(1);

        // ---- Items ----
        doc.font('Bold').fontSize(12.5).text('Order Items', { underline: true });
        doc.moveDown(0.2);

        const startY = doc.y;

        doc.fontSize(12);
        doc.text('Item', 40, startY);
        doc.text('Qty', 300, startY);
        doc.text('Price', 360, startY);
        doc.text('Total', 450, startY);

        doc.strokeColor('#cccccc')
            .moveTo(40, startY + 15)
            .lineTo(560, startY + 15)
            .stroke();

        let y = startY + 25;
        doc.font('Regular');

        order.items.forEach((item) => {
            doc.text(item.productId.name, 40, y, { width: 240 });
            doc.text(item.quantity.toString(), 300, y);
            doc.text(`₹${item.price}`, 360, y);
            doc.text(`₹${item.subtotal}`, 450, y);
            y += 22;
        });

        doc.strokeColor('#cccccc')
            .moveTo(40, y + 5)
            .lineTo(560, y + 5)
            .stroke();

        doc.moveDown(2);

        // ---- Order Summary ----
        const subtotal = order.items.reduce((accume, current) => accume + current.subtotal, 0);
        const tax = Math.round(subtotal * 0.05);
        const shipping = order.shippingCharges || 0;
        const grandTotal = subtotal + tax + shipping;

        doc.font('Bold').fontSize(12.5).text('Order Summary');
        doc.moveDown(0.5);

        printRow(doc, 'Subtotal', `₹ ${subtotal}`, 'Bold', 'Regular', 400);
        printRow(doc, 'Tax(5%)', `₹ ${tax}`, 'Bold', 'Regular', 400);
        printRow(doc, 'Shipping', `₹ ${shipping}`, 'Bold', 'Regular', 400);
        doc.moveDown(0.3);

        const lineY = doc.y;
        doc.strokeColor('#cccccc', 400)
        .lineWidth(1)
        .moveTo(560, lineY)
        .lineTo(250, lineY)
        .stroke();

        doc.moveDown(0.5)

        printRow(doc, 'Grand Total', `₹ ${grandTotal}`, 'Bold', 'Regular', 400);

        doc.moveDown(1);
        doc.fontSize(10).fillColor('#666666').text('Thank you for shopping with us', { align: 'center' });

        doc.end();

    } catch (error) {
        console.log("PDF Error:", error);
    }
};
