

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,       
    pass: process.env.EMAIL_PASS,       
  },
});

const sendOrderConfirmationEmail = async (order) => {
  const customerName  = order.customer?.fullName || order.customer?.firstname || "Valued Client";
  const customerEmail = order.customer?.email || order.email;
  const displayOrderId = order.orderId || (order._id ? order._id.toString().slice(-8).toUpperCase() : "N/A");
  const orderDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Build item rows
  const itemRows = order.items.map(item => {
    const qty   = item.qty || item.quantity || 1;
    const price = Number(item.price || 0);
    const image = item.image || item.images?.[0] || null;

    const imageCell = image
      ? `<img src="${image}" width="48" height="56" style="border-radius:4px; object-fit:cover; display:block;" alt="${item.name}" />`
      : `<div style="width:48px;height:56px;background:#e8ecf2;border-radius:4px;display:flex;align-items:center;justify-content:center;">
           <span style="font-size:18px;">👕</span>
         </div>`;

    return `
      <tr>
        <td style="padding:14px 12px; border-bottom:0.5px solid #f0f4f8;">
          <div style="display:flex; align-items:center; gap:12px;">
            ${imageCell}
            <div>
              <p style="margin:0; font-size:13px; font-weight:500; color:#0d1b2a;">${item.name}</p>
              <p style="margin:3px 0 0; font-size:11px; color:#7a8dae;">
                ${item.size ? `Size: ${item.size}` : ''}
                ${item.size && item.color ? '&nbsp;·&nbsp;' : ''}
                ${item.color ? `Colour: ${item.color}` : ''}
              </p>
            </div>
          </div>
        </td>
        <td style="text-align:center; padding:14px 8px; border-bottom:0.5px solid #f0f4f8; font-size:13px; color:#0d1b2a;">${qty}</td>
        <td style="text-align:right; padding:14px 12px; border-bottom:0.5px solid #f0f4f8; font-size:13px; font-weight:500; color:#0d1b2a;">
          ₦${(price * qty).toLocaleString()}
        </td>
      </tr>
    `;
  }).join("");

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background:#f0f2f5; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="max-width:600px; margin:32px auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e8edf2;">

      <!-- HEADER -->
      <div style="background:#0d1b2a; padding:36px 32px; text-align:center;">
        <div style="display:inline-flex; align-items:center; gap:10px; margin-bottom:6px;">
          <div style="width:32px; height:32px; border:1.5px solid rgba(201,169,110,0.6); display:inline-flex; align-items:center; justify-content:center;">
            <span style="color:#c9a96e; font-size:16px; font-weight:500;">V</span>
          </div>
          <span style="color:#f0e8da; font-size:20px; letter-spacing:0.18em;">VELOURA</span>
        </div>
        <p style="color:rgba(201,169,110,0.7); font-size:10px; letter-spacing:0.28em; text-transform:uppercase; margin:0;">
          Atelier Confirmation
        </p>
      </div>

      <!-- SUCCESS BAR -->
      <div style="background:#1a4731; padding:14px 32px; display:flex; align-items:center; gap:10px;">
        <div style="width:20px; height:20px; border-radius:50%; background:#3da066; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
          <span style="color:white; font-size:12px;">✓</span>
        </div>
        <span style="color:#9fe1cb; font-size:12px; letter-spacing:0.12em; text-transform:uppercase;">
          Payment verified &amp; order confirmed
        </span>
      </div>

      <!-- BODY -->
      <div style="padding:32px;">

        <!-- Greeting -->
        <p style="font-size:22px; color:#0d1b2a; margin:0 0 8px; font-weight:400;">
          Hello, <strong style="font-weight:500;">${customerName}</strong>
        </p>
        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 24px;">
          Thank you for your patronage. Your acquisition has been authenticated and is now being 
          prepared for dispatch from our atelier. You will receive a shipping update once your 
          parcel is en route.
        </p>

        <!-- Order meta -->
        <table style="width:100%; margin-bottom:24px;" cellpadding="0" cellspacing="8">
          <tr>
            <td style="background:#f0f4f8; border-radius:4px; padding:8px 12px; width:25%;">
              <span style="font-size:10px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.1em; display:block;">Order ID</span>
              <span style="font-size:13px; font-weight:500; color:#0d1b2a;">#${displayOrderId}</span>
            </td>
            <td style="background:#f0f4f8; border-radius:4px; padding:8px 12px; width:25%;">
              <span style="font-size:10px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.1em; display:block;">Date</span>
              <span style="font-size:13px; font-weight:500; color:#0d1b2a;">${orderDate}</span>
            </td>
            <td style="background:#eef9f2; border-radius:4px; padding:8px 12px; width:25%; border:0.5px solid #c0e8d0;">
              <span style="font-size:10px; color:#3da066; text-transform:uppercase; letter-spacing:0.1em; display:block;">Status</span>
              <span style="font-size:13px; font-weight:500; color:#1a4731;">Confirmed</span>
            </td>
            <td style="background:#f0f4f8; border-radius:4px; padding:8px 12px; width:25%;">
              <span style="font-size:10px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.1em; display:block;">Reference</span>
              <span style="font-size:11px; font-weight:500; color:#0d1b2a; font-family:monospace;">${order.paymentReference || 'N/A'}</span>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <div style="border-top:0.5px solid #e8edf2; margin-bottom:20px;"></div>
        <p style="font-size:11px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.16em; margin:0 0 14px; font-weight:500;">
          Order manifest
        </p>

        <!-- Items table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="text-align:left; padding:10px 12px; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#7a8dae; font-weight:500; border-bottom:0.5px solid #e8edf2;">Item</th>
              <th style="text-align:center; padding:10px 8px; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#7a8dae; font-weight:500; border-bottom:0.5px solid #e8edf2;">Qty</th>
              <th style="text-align:right; padding:10px 12px; font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#7a8dae; font-weight:500; border-bottom:0.5px solid #e8edf2;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px 12px 4px; text-align:right; font-size:12px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.1em;">Subtotal</td>
              <td style="padding:12px 12px 4px; text-align:right; font-size:13px; color:#0d1b2a;">₦${Number(order.totalAmount || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:4px 12px; text-align:right; font-size:12px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.1em;">Logistics</td>
              <td style="padding:4px 12px; text-align:right; font-size:13px; color:#3da066; font-weight:500;">Complimentary</td>
            </tr>
            <tr style="border-top:1.5px solid #0d1b2a;">
              <td colspan="2" style="padding:14px 12px; text-align:right; font-size:12px; color:#0d1b2a; text-transform:uppercase; letter-spacing:0.12em; font-weight:500;">Total</td>
              <td style="padding:14px 12px; text-align:right; font-size:20px; color:#0d1b2a; font-weight:500;">₦${Number(order.totalAmount || 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Shipping address -->
        <div style="background:#f8f9fa; border-radius:6px; padding:16px; margin-bottom:28px; border-left:2px solid #c9a96e;">
          <p style="font-size:10px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.14em; margin:0 0 8px; font-weight:500;">Dispatch address</p>
          <p style="font-size:13px; color:#0d1b2a; margin:0; line-height:1.8;">
            ${order.customer?.fullName || ''}<br>
            ${order.customer?.address || ''}<br>
            ${order.customer?.city || ''}, ${order.customer?.state || ''}<br>
            ${order.customer?.country || ''}<br>
            <span style="color:#7a8dae;">${order.customer?.phone || ''}</span>
          </p>
        </div>

        <!-- Closing -->
        <div style="border-top:0.5px solid #e8edf2; padding-top:20px; text-align:center;">
          <p style="font-size:13px; color:#5a6a7a; margin:0 0 4px;">
            Questions? Reply to this email or reach our atelier team.
          </p>
          <p style="font-size:12px; color:#c9a96e; margin:0; letter-spacing:0.06em;">
            support@veloura.com
          </p>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="background:#f8f9fa; padding:20px 32px; text-align:center; border-top:0.5px solid #e8edf2;">
        <p style="font-size:11px; color:#7a8dae; margin:0 0 4px; letter-spacing:0.1em; text-transform:uppercase;">
          Veloura Atelier &nbsp;·&nbsp; Lagos, Nigeria
        </p>
        <p style="font-size:10px; color:#aab4be; margin:0;">
          &copy; ${new Date().getFullYear()} Veloura. All rights reserved.
        </p>
      </div>

    </div>
  </body>
  </html>
  `;

  return transporter.sendMail({
    from: `"Veloura Atelier" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Confirmed — #${displayOrderId}`,
    html,
  });
};

module.exports = { sendOrderConfirmationEmail };