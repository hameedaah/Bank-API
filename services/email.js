const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.Email,
    pass: process.env.EmailPassword,
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: "noreply@gmail.com", // Sender's email address
    to, // Recipient's email address
    subject, // Email subject
    text, // Email body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info.response;
  } catch (error) {
    console.error("Error:", error.message);
    throw Error(error);
  }
}

module.exports = sendEmail;
