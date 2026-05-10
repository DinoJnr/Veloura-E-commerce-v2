// mails/returns/returnapprovedmail.js
// Trigger: Return status moves from pending → approved
// Message: Your return request has been approved — here is how to send your items back

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const returnApprovedMail = async (order) => {
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
                  text-transform:uppercase; margin:0;">Return Approved</p>
      </div>

      <!-- NOTICE BAR -->
      <div style="background:#1a3a2a; padding:14px 32px; display:flex; align-items:center; gap:10px;">
        <div style="width:20px; height:20px; border-radius:50%; background:#3da066;
                    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
          <span style="color:white; font-size:12px;">✓</span>
        </div>
        <span style="color:#9fe1cb; font-size:12px; letter-spacing:0.12em; text-transform:uppercase;">
          Your return has been approved — action required
        </span>
      </div>

      <!-- BODY -->
      <div style="padding:32px;">

        <p style="font-size:22px; color:#0d1b2a; margin:0 0 8px; font-weight:400;">
          Hello, <strong style="font-weight:500;">${customer?.fullName || "Valued Customer"}</strong>
        </p>
        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 12px;">
          Great news — your return request for order
          <strong style="color:#0d1b2a;">#${orderId || "—"}</strong> has been
          <strong style="color:#1a4731;">approved</strong>. You may now proceed to send your
          items back to us following the instructions below.
        </p>
        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 28px;">
          Once we receive and inspect your returned items, your refund of
          <strong style="color:#0d1b2a;">${formatCurrency(totalAmount)}</strong> will be processed
          promptly. Please follow the steps carefully to avoid any delays.
        </p>

        <!-- Return instructions -->
        <div style="background:#f2fbf7; border:0.5px solid #a8d8bf; border-radius:8px;
                    padding:20px; margin-bottom:24px;">
          <p style="font-size:11px; color:#1a6040; text-transform:uppercase; letter-spacing:0.14em;
                    margin:0 0 16px; font-weight:600;">How to send your items back</p>

          <!-- Step 1 -->
          <div style="display:flex; gap:12px; margin-bottom:14px; align-items:flex-start;">
            <div style="min-width:24px; height:24px; border-radius:50%; background:#3da066;
                        display:flex; align-items:center; justify-content:center; margin-top:1px;">
              <span style="color:white; font-size:11px; font-weight:700;">1</span>
            </div>
            <div>
              <p style="font-size:13px; font-weight:600; color:#0d1b2a; margin:0 0 3px;">Package your items securely</p>
              <p style="font-size:12px; color:#5a6a7a; margin:0; line-height:1.65;">
                Place the items in their original packaging if possible. Include all tags, accessories,
                and any original wrapping. Items must be unworn, unwashed, and in original condition.
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div style="display:flex; gap:12px; margin-bottom:14px; align-items:flex-start;">
            <div style="min-width:24px; height:24px; border-radius:50%; background:#3da066;
                        display:flex; align-items:center; justify-content:center; margin-top:1px;">
              <span style="color:white; font-size:11px; font-weight:700;">2</span>
            </div>
            <div>
              <p style="font-size:13px; font-weight:600; color:#0d1b2a; margin:0 0 3px;">Write your order ID on the package</p>
              <p style="font-size:12px; color:#5a6a7a; margin:0; line-height:1.65;">
                Clearly label the outside of the package with your order ID
                <strong style="color:#0d1b2a;">#${orderId || "—"}</strong> so our team can
                identify your return immediately on arrival.
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <div style="min-width:24px; height:24px; border-radius:50%; background:#3da066;
                        display:flex; align-items:center; justify-content:center; margin-top:1px;">
              <span style="color:white; font-size:11px; font-weight:700;">3</span>
            </div>
            <div>
              <p style="font-size:13px; font-weight:600; color:#0d1b2a; margin:0 0 3px;">Send to our return address</p>
              <p style="font-size:12px; color:#5a6a7a; margin:0 0 8px; line-height:1.65;">
                Drop off or arrange delivery of your package to the address below. We recommend using
                a trackable courier service and keeping your receipt.
              </p>
              <div style="background:#ffffff; border:0.5px solid #c0e0d0; border-radius:6px;
                          padding:12px 14px;">
                <p style="font-size:12px; font-weight:600; color:#0d1b2a; margin:0 0 2px;">
                  Veloura Returns Centre
                </p>
                <p style="font-size:12px; color:#5a6a7a; margin:0; line-height:1.6;">
                  [Your Return Address Here]<br/>
                  Lagos, Nigeria
                </p>
              </div>
            </div>
          </div>
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
            <td style="background:#f0fbf6; border-radius:4px; padding:8px 12px; width:25%;
                       border:0.5px solid #a0d8bc;">
              <span style="font-size:10px; color:#1a6040; text-transform:uppercase;
                           letter-spacing:0.1em; display:block;">Return Status</span>
              <span style="font-size:13px; font-weight:500; color:#0f4028;">Approved ✓</span>
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
                  margin:0 0 14px; font-weight:500;">Approved items for return</p>

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
                                     letter-spacing:0.12em; font-weight:500;">Refund Value</td>
              <td style="padding:14px 12px; text-align:right; font-size:20px;
                         color:#0d1b2a; font-weight:500;">${formatCurrency(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background:#f8f9fa; border-radius:6px; padding:16px; margin-bottom:28px;
                    border-left:2px solid #c9a96e;">
          <p style="font-size:13px; color:#0d1b2a; margin:0; line-height:1.75;">
            ✦ <strong>Important:</strong> Your refund of <strong>${formatCurrency(totalAmount)}</strong>
            will only be processed <em>after</em> we receive and inspect your returned items.
            Please ship within <strong>5 business days</strong> to avoid your return window expiring.
          </p>
        </div>

        <div style="border-top:0.5px solid #e8edf2; padding-top:20px; text-align:center;">
          <p style="font-size:13px; color:#5a6a7a; margin:0 0 4px;">
            Questions about your return? Reply to this email and we will help.
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
    subject: `Return Approved — Please Send Your Items Back #${orderId || "—"} | Veloura`,
    html,
  });
};

module.exports = { returnApprovedMail };