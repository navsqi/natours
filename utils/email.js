const nodemailer = require('nodemailer');

const sendEmail = options => {
  // 1) set transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) set message option
  const message = {
    from: 'Nauval Shidqi <hello@nauval.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: "<p>HTML version of the message</p>"
  };

  // 3) actually sent the email
  transporter.sendMail(message);
};

module.exports = sendEmail;
