// mails/returns/returnrefundedmail.js
// Trigger: Return status moves from received → refunded
//          (inspection passed, refund has been issued to original payment method)
// Message: Your return is complete — your refund has been sent

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const returnRefundedMail = async (order) => {
  const {
    customer,
    items = [],
    totalAmount,
    orderId,
    paymentReference,
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
                  text-transform:uppercase; margin:0;">Return Complete</p>
      </div>

      <!-- NOTICE BAR — celebration green -->
      <div style="background:#1a3a2a; padding:14px 32px; display:flex; align-items:center; gap:10px;">
        <div style="width:20px; height:20px; border-radius:50%; background:#3da066;
                    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
          <span style="color:white; font-size:12px;">↩</span>
        </div>
        <span style="color:#9fe1cb; font-size:12px; letter-spacing:0.12em; text-transform:uppercase;">
          Refund issued — your return journey is complete
        </span>
      </div>

      <!-- BODY -->
      <div style="padding:32px;">

        <p style="font-size:22px; color:#0d1b2a; margin:0 0 8px; font-weight:400;">
          Hello, <strong style="font-weight:500;">${customer?.fullName || "Valued Customer"}</strong>
        </p>
        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 12px;">
          We are happy to confirm that your return for order
          <strong style="color:#0d1b2a;">#${orderId || "—"}</strong> has been fully processed.
          Our inspection is complete and your <strong style="color:#1a4731;">refund of
          ${formatCurrency(totalAmount)}</strong> has been issued back to your original
          payment method.
        </p>
        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 28px;">
          Please allow <strong>3–7 business days</strong> for the funds to appear in your
          account, depending on your bank or payment provider. If you do not see it after
          7 business days, please reach out and we will investigate immediately.
        </p>

        <!-- Refund summary card -->
        <div style="background:#f2fbf7; border:0.5px solid #a8d8bf; border-radius:8px;
                    padding:22px 24px; margin-bottom:24px; text-align:center;">
          <p style="font-size:11px; color:#1a6040; text-transform:uppercase; letter-spacing:0.14em;
                    margin:0 0 8px; font-weight:600;">Refund issued</p>
          <p style="font-size:36px; font-weight:600; color:#0d1b2a; margin:0 0 6px;
                    letter-spacing:-0.02em;">${formatCurrency(totalAmount)}</p>
          <p style="font-size:13px; color:#5a6a7a; margin:0 0 12px;">
            Returning to your original payment method
          </p>
          <div style="background:#ffffff; border:0.5px solid #c0e0d0; border-radius:6px;
                      padding:10px 16px; display:inline-block;">
            <p style="font-size:11px; color:#7a8dae; text-transform:uppercase;
                      letter-spacing:0.1em; margin:0 0 3px;">Payment Reference</p>
            <p style="font-size:13px; font-weight:500; color:#0d1b2a; margin:0;
                      font-family:monospace;">${paymentReference || "N/A"}</p>
          </div>
        </div>

        <!-- Completed progress tracker -->
        <div style="background:#f8f9fa; border-radius:8px; padding:20px 24px; margin-bottom:24px;">
          <p style="font-size:11px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.14em;
                    margin:0 0 18px; font-weight:600;">Return journey — complete</p>
          <table style="width:100%;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center; width:25%; vertical-align:top;">
                <div style="width:28px; height:28px; border-radius:50%; background:#c9a96e;
                            margin:0 auto 6px; display:flex; align-items:center; justify-content:center;">
                  <span style="color:white; font-size:13px;">✓</span>
                </div>
                <p style="font-size:11px; color:#c9a96e; font-weight:600; margin:0 0 2px;">Requested</p>
                <p style="font-size:10px; color:#aab4be; margin:0;">Done</p>
              </td>
              <td style="vertical-align:middle; padding-bottom:20px;">
                <div style="height:1.5px; background:#c9a96e;"></div>
              </td>
              <td style="text-align:center; width:25%; vertical-align:top;">
                <div style="width:28px; height:28px; border-radius:50%; background:#c9a96e;
                            margin:0 auto 6px; display:flex; align-items:center; justify-content:center;">
                  <span style="color:white; font-size:13px;">✓</span>
                </div>
                <p style="font-size:11px; color:#c9a96e; font-weight:600; margin:0 0 2px;">Approved</p>
                <p style="font-size:10px; color:#aab4be; margin:0;">Done</p>
              </td>
              <td style="vertical-align:middle; padding-bottom:20px;">
                <div style="height:1.5px; background:#c9a96e;"></div>
              </td>
              <td style="text-align:center; width:25%; vertical-align:top;">
                <div style="width:28px; height:28px; border-radius:50%; background:#c9a96e;
                            margin:0 auto 6px; display:flex; align-items:center; justify-content:center;">
                  <span style="color:white; font-size:13px;">✓</span>
                </div>
                <p style="font-size:11px; color:#c9a96e; font-weight:600; margin:0 0 2px;">Received</p>
                <p style="font-size:10px; color:#aab4be; margin:0;">Done</p>
              </td>
              <td style="vertical-align:middle; padding-bottom:20px;">
                <div style="height:1.5px; background:#c9a96e;"></div>
              </td>
              <td style="text-align:center; width:25%; vertical-align:top;">
                <div style="width:28px; height:28px; border-radius:50%; background:#3da066;
                            margin:0 auto 6px; display:flex; align-items:center; justify-content:center;">
                  <span style="color:white; font-size:13px;">✓</span>
                </div>
                <p style="font-size:11px; color:#1a4731; font-weight:700; margin:0 0 2px;">Refunded</p>
                <p style="font-size:10px; color:#3da066; margin:0; font-weight:500;">Complete</p>
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
            <td style="background:#f0fbf5; border-radius:4px; padding:8px 12px; width:25%;
                       border:0.5px solid #90d4b0;">
              <span style="font-size:10px; color:#1a6040; text-transform:uppercase;
                           letter-spacing:0.1em; display:block;">Return Status</span>
              <span style="font-size:13px; font-weight:500; color:#0f4028;">Refunded ✓</span>
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
                  margin:0 0 14px; font-weight:500;">Returned items</p>

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
                                     letter-spacing:0.12em; font-weight:500;">Total Refunded</td>
              <td style="padding:14px 12px; text-align:right; font-size:20px;
                         color:#0d1b2a; font-weight:500;">${formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Final note -->
        <div style="background:#f8f9fa; border-radius:6px; padding:16px; margin-bottom:28px;
                    border-left:2px solid #3da066;">
          <p style="font-size:13px; color:#1a4731; margin:0; line-height:1.75;">
            💚 <strong>Refund of ${formatCurrency(totalAmount)}</strong> is on its way.
            If you do not see it within 7 business days, contact us quoting
            <strong>${paymentReference || `#${orderId}` || "your order reference"}</strong>
            and we will chase it with your bank on your behalf.
          </p>
        </div>

        <!-- Shop again nudge -->
        <div style="text-align:center; margin-bottom:28px;">
          <p style="font-size:13px; color:#5a6a7a; margin:0 0 12px;">
            We hope to serve you again soon. Every new season brings something worth wearing.
          </p>
        </div>

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
    subject: `Refund Issued — Your Return Is Complete #${orderId || "—"} | Veloura`,
    html,
  });
};

module.exports = { returnRefundedMail };