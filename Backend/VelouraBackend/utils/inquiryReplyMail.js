const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const inquiryReplyMail = async ({ to, subject, message, firstName, attachments = [] }) => {
  const mailAttachments = attachments.map((file) => ({
    filename: file.originalname,
    content:  file.buffer,
    contentType: file.mimetype,
  }));

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
          Response to Your Inquiry
        </p>
      </div>

      <!-- NOTICE BAR -->
      <div style="background:#1a2a3a; padding:14px 32px; display:flex; align-items:center; gap:10px;">
        <div style="width:20px; height:20px; border-radius:50%; background:#4a7ab5;
                    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
          <span style="color:white; font-size:12px;">✉</span>
        </div>
        <span style="color:#a8c4e0; font-size:12px; letter-spacing:0.12em; text-transform:uppercase;">
          Our concierge team has responded
        </span>
      </div>

      <!-- BODY -->
      <div style="padding:32px;">

        <!-- Greeting -->
        <p style="font-size:22px; color:#0d1b2a; margin:0 0 8px; font-weight:400;">
          Hello, <strong style="font-weight:500;">${firstName || "Valued Client"}</strong>
        </p>
        <p style="font-size:14px; color:#5a6a7a; line-height:1.7; margin:0 0 24px;">
          Thank you for reaching out to the Veloura Atelier. Our team has reviewed
          your inquiry and we are pleased to respond below.
        </p>

        <!-- Divider -->
        <div style="border-top:0.5px solid #e8edf2; margin-bottom:20px;"></div>
        <p style="font-size:11px; color:#7a8dae; text-transform:uppercase; letter-spacing:0.16em;
                  margin:0 0 14px; font-weight:500;">
          Our Response
        </p>

        <!-- Message box -->
        <div style="background:#f8f9fb; border-radius:8px; padding:22px 24px;
                    border-left:2px solid #c9a96e; margin-bottom:28px;">
          <p style="font-size:14px; color:#1a2533; line-height:1.8; margin:0; white-space:pre-wrap;">
            ${message}
          </p>
        </div>

        ${mailAttachments.length > 0 ? `
        <!-- Attachments notice -->
        <div style="background:#f0f4f8; border-radius:6px; padding:14px 16px; margin-bottom:28px;
                    display:flex; align-items:flex-start; gap:12px;">
          <span style="font-size:18px; flex-shrink:0;">📎</span>
          <div>
            <p style="font-size:12px; font-weight:500; color:#0d1b2a; margin:0 0 4px;
                      text-transform:uppercase; letter-spacing:0.1em;">
              ${mailAttachments.length} Attachment${mailAttachments.length > 1 ? "s" : ""} Included
            </p>
            <p style="font-size:12px; color:#5a6a7a; margin:0; line-height:1.6;">
              ${mailAttachments.map((a) => a.filename).join(" &nbsp;·&nbsp; ")}
            </p>
          </div>
        </div>
        ` : ""}

        <!-- Follow-up note -->
        <div style="background:#fdf9f3; border-radius:6px; padding:16px;
                    border:0.5px solid #e8d9b8; margin-bottom:28px;">
          <p style="font-size:13px; color:#7a5c2a; margin:0; line-height:1.75;">
            ✨ If you have any further questions or require additional assistance,
            simply <strong>reply to this email</strong> and our team will be happy to help.
          </p>
        </div>

        <!-- Closing -->
        <div style="border-top:0.5px solid #e8edf2; padding-top:20px; text-align:center;">
          <p style="font-size:13px; color:#5a6a7a; margin:0 0 4px;">
            Warm regards from the Veloura Atelier team.
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
    from:        `"Veloura Atelier" <${process.env.EMAIL_USER}>`,
    to,
    subject:     subject || "Response to Your Inquiry — Veloura",
    html,
    attachments: mailAttachments,
  });
};

module.exports = { inquiryReplyMail };