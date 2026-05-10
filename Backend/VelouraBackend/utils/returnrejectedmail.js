// mails/returns/returnrejectedmail.js
// Trigger: Return status moves from pending → rejected
// Message: Sorry, your return request could not be approved — here is why and what you can do

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const returnRejectedMail = async (order) => {
  const {
    customer,
    items = [],
    totalAmount,
    orderId,
    paymentReference,
    returnRejectionReason, // optional: pass a reason string if available
  } = order;

  const customerEmail = customer?.email;

  const formatCurrency = (amount) =>
    `₦${Number(amount || 0).toLocaleString("en-NG")}`;

  const orderDate =
    order.orderDate || order.createdAt
      ? new Date(order.orderDate || order.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  const itemRows = items
    .map((item) => {
      const qty   = item.qty || item.quantity || 1;
      const price = Number(item.price || 0);
      const image = item.image || item.images?.[0] || null;

      const imageCell = image
        ? `<img src="${image}" width="48" height="56"
             style="border-radius:4px; object-fit:cover; display:block;" alt="${item.name}" />`
        : `<div style="width:48px;height:56px;background:#e8ecf2;border-radius:4px;
                       display:flex;align-items:center;justify-content:center;">
             <span style="font-size:18px;">👕</span>
           </div>`;

      return `
        <tr>
          <td style="padding:14px 12px; border-bottom:0.5px solid #f0f4f8;">
            <div style="display:flex; align-items:center; gap:12px;">
              ${imageCell}
              <div>
                <p style="margin:0; font-size:13px; font-weight:500; color:#0d1b2a;">${item.name || "—"}</p>
                <p style="margin:3px 0 0; font-size:11px; color:#7a8dae;">
                  ${item.size ? `Size: ${item.size}` : ""}
                  ${item.size && item.color ? "&nbsp;·&nbsp;" : ""}
                  ${item.color ? `Colour: ${item.color}` : ""}
                </p>
              </div>
            </div>
          </td>
          <td style="text-align:center; padding:14px 8px; border-bottom:0.5px solid #f0f4f8;
                     font-size:13px; color:#0d1b2a;">${qty}</td>
          <td style="text-align:right; padding:14px 12px; border-bottom:0.5px solid #f0f4f8;
                     font-size:13px; color:#0d1b2a;">${formatCurrency(price)}</td>
          <td style="text-align:right; padding:14px 12px; border-bottom:0.5px solid #f0f4f8;
                     font-size:13px; font-weight:500; color:#0d1b2a;">${formatCurrency(price * qty)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background:#f0f2f5; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="max-width:600px; margin:32px auto; background:#ffffff; border-radius:8px;
                overflow:hidden; border:1px solid #e8edf2;">

      <!-- HEADER -->
      <div style="background:#0d1b2a; padding:36px 32px; text-align:center;">
        <div style="display:inline-flex; align-items:center; gap:10px; margin-bottom:6px;">
          <div style="width:32px; height:32px; border:1.5px solid rgba(201,169,110,0.6);
                      display:inline-flex; align-items:center; justify-content:center;">
            <span style="color:#c9a96e; font-size:16px; font-weight:500;">V</span>
          </div>
          <span style="color:#f0e8da; font-size:20px; letter-spacing:0.18em;">VELOURA</span>
        </div>
        <p style="color:rgba(201,169,110,0.7); font-size:10px; letter-spacing:0.28em;
                  text-transform:uppercase; margin:0;">Return Request Update</p>
      </div>

      <!-- NOTICE BAR -->
      <div style="background:#2e1a1a; padding:14px 32px; display:flex; align-items:center; gap:10px;">
        <div style="width:20px; height:20px; border-radius:50%; background:#c0392b;
                    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
          <span style="color:white; font-size:12px; font-weight:600;">✕</span>
        </div>
        <span style="color:#f0b8b8; font-size:12px; letter-spacing:0.12em; text-transform:uppercase;">
          We were unable to approve your return request
        </span>
      </div>

      <!-- BODY -->
      <div style="padding:32px;">

        <p style="font-size:22px; color:#0d1b2a; margin:0 0 8px; font-weight:400;">
          Hello, <strong style="font-weight:500;">${customer?.fullName || "Valued Customer"}</strong>
        </p>
        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 12px;">
          We are sorry to inform you that your return request for order
          <strong style="color:#0d1b2a;">#${orderId || "—"}</strong> has been
          <strong style="color:#922b21;">rejected</strong> after careful review by our team.
          We understand this is not the outcome you were hoping for, and we sincerely apologise
          for any inconvenience.
        </p>

        ${returnRejectionReason ? `
        <!-- Rejection reason -->
        <div style="background:#fff8f8; border:0.5px solid #f0cccc; border-radius:8px;
                    padding:16px 18px; margin-bottom:20px;">
          <p style="font-size:10px; color:#c0392b; text-transform:uppercase; letter-spacing:0.12em;
                    margin:0 0 6px; font-weight:600;">Reason for rejection</p>
          <p style="font-size:13px; color:#5a6a7a; margin:0; line-height:1.7;">
            ${returnRejectionReason}
          </p>
        </div>
        ` : `
        <!-- Generic reason block -->
        <div style="background:#fff8f8; border:0.5px solid #f0cccc; border-radius:8px;
                    padding:16px 18px; margin-bottom:20px;">
          <p style="font-size:10px; color:#c0392b; text-transform:uppercase; letter-spacing:0.12em;
                    margin:0 0 8px; font-weight:600;">Common reasons for return rejection</p>
          <ul style="font-size:13px; color:#5a6a7a; margin:0; padding-left:18px; line-height:1.85;">
            <li>The return window for this order has closed</li>
            <li>Items show signs of wear, washing, or damage not caused by us</li>
            <li>Tags or original packaging have been removed</li>
            <li>The item was marked as a final sale or non-returnable product</li>
          </ul>
        </div>
        `}

        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 28px;">
          If you believe this decision was made in error, or you have additional information
          that may support your case, please do not hesitate to reach out. We are happy to
          take a second look.
        </p>

        <!-- What you can do -->
        <div style="background:#f5f8ff; border:0.5px solid #c0d0f0; border-radius:8px;
                    padding:20px; margin-bottom:24px;">
          <p style="font-size:11px; color:#1a3a6e; text-transform:uppercase; letter-spacing:0.14em;
                    margin:0 0 14px; font-weight:600;">What you can do</p>
          <table style="width:100%;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:top; padding-bottom:14px; width:28px;">
                <span style="font-size:16px;">✉️</span>
              </td>
              <td style="vertical-align:top; padding-bottom:14px; padding-left:10px;">
                <p style="font-size:13px; font-weight:600; color:#0d1b2a; margin:0 0 3px;">
                  Appeal the decision
                </p>
                <p style="font-size:12px; color:#5a6a7a; margin:0; line-height:1.65;">
                  Reply to this email with any supporting evidence — photos, receipts, or a
                  description of the issue — and our team will review your case within
                  2 business days.
                </p>
              </td>
            </tr>
            <tr>
              <td style="vertical-align:top; width:28px;">
                <span style="font-size:16px;">📞</span>
              </td>
              <td style="vertical-align:top; padding-left:10px;">
                <p style="font-size:13px; font-weight:600; color:#0d1b2a; margin:0 0 3px;">
                  Speak to our team directly
                </p>
                <p style="font-size:12px; color:#5a6a7a; margin:0; line-height:1.65;">
                  Sometimes a quick conversation resolves things faster. Reach us at
                  <strong style="color:#c9a96e;">support@veloura.com</strong> and reference
                  order <strong>#${orderId || "—"}</strong>.
                </p>
              </td>
            </tr>
          </table>
        </div>

        <!-- Order meta -->
        <table style="width:100%; margin-bottom:24px;" cellpadding="0" cellspacing="8">
          <tr>
            <td style="background:#f0f4f8; border-radius:4px; padding:8px 12px; width:25%;">
              <span style="font-size:10px; color:#7a8dae; text-transform:uppercase;
                           letter-spacing:0.1em; display:block;">Order ID</span>
              <span style="font-size:13px; font-weight:500; color:#0d1b2a;">#${orderId || "—"}</span>
            </td>
            <td style="background:#f0f4f8; border-radius:4px; padding:8px 12px; width:25%;">
              <span style="font-size:10px; color:#7a8dae; text-transform:uppercase;
                           letter-spacing:0.1em; display:block;">Date</span>
              <span style="font-size:13px; font-weight:500; color:#0d1b2a;">${orderDate}</span>
            </td>
            <td style="background:#fff3f3; border-radius:4px; padding:8px 12px; width:25%;
                       border:0.5px solid #f0cccc;">
              <span style="font-size:10px; color:#c0392b; text-transform:uppercase;
                           letter-spacing:0.1em; display:block;">Return Status</span>
              <span style="font-size:13px; font-weight:500; color:#922b21;">Rejected</span>
            </td>
            <td style="background:#f0f4f8; border-radius:4px; padding:8px 12px; width:25%;">
              <span style="font-size:10px; color:#7a8dae; text-transform:uppercase;
                           letter-spacing:0.1em; display:block;">Reference</span>
              <span style="font-size:11px; font-weight:500; color:#0d1b2a;
                           font-family:monospace;">${paymentReference || "N/A"}</span>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <div style="border-top:0.5px solid #e8edf2; margin-bottom:20px;"></div>
        <p style="font-size:11px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.16em;
                  margin:0 0 14px; font-weight:500;">Items in the return request</p>

        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="text-align:left; padding:10px 12px; font-size:10px; text-transform:uppercase;
                         letter-spacing:0.12em; color:#7a8dae; font-weight:500;
                         border-bottom:0.5px solid #e8edf2;">Item</th>
              <th style="text-align:center; padding:10px 8px; font-size:10px; text-transform:uppercase;
                         letter-spacing:0.12em; color:#7a8dae; font-weight:500;
                         border-bottom:0.5px solid #e8edf2;">Qty</th>
              <th style="text-align:right; padding:10px 12px; font-size:10px; text-transform:uppercase;
                         letter-spacing:0.12em; color:#7a8dae; font-weight:500;
                         border-bottom:0.5px solid #e8edf2;">Unit Price</th>
              <th style="text-align:right; padding:10px 12px; font-size:10px; text-transform:uppercase;
                         letter-spacing:0.12em; color:#7a8dae; font-weight:500;
                         border-bottom:0.5px solid #e8edf2;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr style="border-top:1.5px solid #0d1b2a;">
              <td colspan="3" style="padding:14px 12px; text-align:right; font-size:12px;
                                     color:#0d1b2a; text-transform:uppercase;
                                     letter-spacing:0.12em; font-weight:500;">Order Total</td>
              <td style="padding:14px 12px; text-align:right; font-size:20px;
                         color:#0d1b2a; font-weight:500;">${formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="border-top:0.5px solid #e8edf2; padding-top:20px; text-align:center;">
          <p style="font-size:13px; color:#5a6a7a; margin:0 0 4px;">
            We are sorry we could not do more. Our team is always available to help resolve this.
          </p>
          <p style="font-size:12px; color:#c9a96e; margin:0; letter-spacing:0.06em;">
            support@veloura.com
          </p>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="background:#f8f9fa; padding:20px 32px; text-align:center;
                  border-top:0.5px solid #e8edf2;">
        <p style="font-size:11px; color:#7a8dae; margin:0 0 4px; letter-spacing:0.1em;
                  text-transform:uppercase;">Veloura Atelier &nbsp;·&nbsp; Lagos, Nigeria</p>
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
    subject: `Return Request Update — #${orderId || "—"} | Veloura`,
    html,
  });
};

module.exports = { returnRejectedMail };