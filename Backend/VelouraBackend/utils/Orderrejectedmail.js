// mails/orderrejectedmail.js
// Trigger: Order status moves to rejected
// Message: Your order has been rejected — refund can be initiated, or order can be restored if it was a mistake

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const orderRejectedMail = async (order) => {
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

  // ── Item rows ──────────────────────────────────────────────────────────────
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

  // ── HTML ───────────────────────────────────────────────────────────────────
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
                  text-transform:uppercase; margin:0;">
          Order Update
        </p>
      </div>

      <!-- NOTICE BAR — muted red, not alarming -->
      <div style="background:#2e1a1a; padding:14px 32px; display:flex; align-items:center; gap:10px;">
        <div style="width:20px; height:20px; border-radius:50%; background:#c0392b;
                    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
          <span style="color:white; font-size:12px; font-weight:600;">✕</span>
        </div>
        <span style="color:#f0b8b8; font-size:12px; letter-spacing:0.12em; text-transform:uppercase;">
          Your order could not be processed at this time
        </span>
      </div>

      <!-- BODY -->
      <div style="padding:32px;">

        <!-- Greeting -->
        <p style="font-size:22px; color:#0d1b2a; margin:0 0 8px; font-weight:400;">
          Hello, <strong style="font-weight:500;">${customer?.fullName || "Valued Customer"}</strong>
        </p>

        <!-- Apology copy -->
        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 12px;">
          We are truly sorry. Your order <strong style="color:#0d1b2a;">#${orderId || "—"}</strong>
          has been <strong style="color:#922b21;">rejected</strong> and could not be fulfilled at
          this time. This may be due to item unavailability, a stock discrepancy, or an operational
          issue on our end — none of which is your fault.
        </p>
        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 28px;">
          We understand how frustrating this can be, and we want to make it right. Please see your
          options below.
        </p>

        <!-- TWO ACTION CARDS -->
        <table style="width:100%; border-collapse:separate; border-spacing:10px; margin-bottom:24px;">
          <tr>
            <!-- Refund card -->
            <td style="width:50%; vertical-align:top; background:#fff8f8; border:0.5px solid #f0cccc;
                       border-radius:8px; padding:18px 16px;">
              <p style="font-size:18px; margin:0 0 6px;">💸</p>
              <p style="font-size:13px; font-weight:600; color:#922b21; margin:0 0 6px;
                        text-transform:uppercase; letter-spacing:0.08em;">Request a Refund</p>
              <p style="font-size:12px; color:#5a6a7a; margin:0 0 12px; line-height:1.65;">
                If you would like your money back, we can process a full refund of
                <strong style="color:#0d1b2a;">${formatCurrency(totalAmount)}</strong> to your
                original payment method. Allow <strong>3–7 business days</strong> for it to reflect.
              </p>
              <p style="font-size:11px; color:#c0392b; margin:0;">
                Reply to this email with <strong>"REFUND #${orderId || "—"}"</strong> to initiate.
              </p>
            </td>

            <!-- Restore card -->
            <td style="width:50%; vertical-align:top; background:#f5f8ff; border:0.5px solid #c0d0f0;
                       border-radius:8px; padding:18px 16px;">
              <p style="font-size:18px; margin:0 0 6px;">↺</p>
              <p style="font-size:13px; font-weight:600; color:#1a3a6e; margin:0 0 6px;
                        text-transform:uppercase; letter-spacing:0.08em;">Restore My Order</p>
              <p style="font-size:12px; color:#5a6a7a; margin:0 0 12px; line-height:1.65;">
                If you believe this rejection was a mistake, we can reinstate your order immediately
                and continue processing it as normal — no need to place a new one.
              </p>
              <p style="font-size:11px; color:#1a3a6e; margin:0;">
                Reply with <strong>"RESTORE #${orderId || "—"}"</strong> and we will fix it right away.
              </p>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <div style="border-top:0.5px solid #e8edf2; margin-bottom:20px;"></div>

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
                           letter-spacing:0.1em; display:block;">Status</span>
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

        <p style="font-size:11px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.16em;
                  margin:0 0 14px; font-weight:500;">
          Items in the rejected order
        </p>

        <!-- Items table -->
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

        <!-- Reassurance note -->
        <div style="background:#f8f9fa; border-radius:6px; padding:16px; margin-bottom:28px;
                    border-left:2px solid #c9a96e;">
          <p style="font-size:13px; color:#0d1b2a; margin:0; line-height:1.75;">
            ✦ <strong>Your money is safe.</strong> No charges have been permanently deducted.
            Whether you choose a refund or a restoration, our team will act on your reply within
            <strong>24 hours</strong> on business days.
          </p>
        </div>

        <!-- Closing -->
        <div style="border-top:0.5px solid #e8edf2; padding-top:20px; text-align:center;">
          <p style="font-size:13px; color:#5a6a7a; margin:0 0 4px;">
            We are sorry again for the trouble. Our team is always here to help.
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
                  text-transform:uppercase;">
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
    subject: `Important Update on Your Order #${orderId || "—"} | Veloura`,
    html,
  });
};

module.exports = { orderRejectedMail };