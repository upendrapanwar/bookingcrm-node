const config = require("../config/index")
const nodemailer = require("nodemailer");

// Create a transporter using your Gmail account
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.mail_auth_user,
        pass: config.mail_auth_pass,
    }
});


// Send email function
const sendEmail = async (emailData) => {
    const { from, replyTo, to, subject, text, html } = emailData;

    try {
        const mailOptions = {
            from: from,
            replyTo: replyTo,
            to: to,
            subject: subject,
            text: text,
            html: html,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;

